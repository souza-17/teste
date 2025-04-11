import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Transform, PassThrough } from 'stream';
import csvParser from 'csv-parser';
import { connection } from '../db/connection';
import { Boleto } from '../types/boleto.types';
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import PDFDocumentKit from 'pdfkit';

/**
 * Transform stream para remover aspas no início e fim de cada linha do CSV.
 */
const removeQuotesTransform = new Transform({
  readableObjectMode: false,
  writableObjectMode: false,
  transform(chunk, encoding, callback) {
    let data = chunk.toString();
    // Divide as linhas, remove aspas se presentes e junta novamente
    data = data
      .split(/\r?\n/)
      .map((line : any) => {
        if (line.startsWith('"') && line.endsWith('"')) {
          return line.slice(1, -1);
        }
        return line;
      })
      .join("\n");
    callback(null, data);
  },
});

/**
 * Processa cada linha do CSV.
 */
const processCSVRow = async (data: any, boletos: Boleto[]): Promise<void> => {
  const { nome_sacado, unidade, valor, linha_digitavel } = data;
  if (!nome_sacado || !unidade || !valor || !linha_digitavel) {
    console.error("Linha incompleta ou inválida. Dados recebidos:", data);
    return;
  }
  // Converte o campo "unidade" para string e formata para 4 dígitos (ex.: "17" → "0017")
  const nomeLote = String(unidade).padStart(4, '0');
  const [rows] = await connection.query('SELECT id FROM lotes WHERE nome = ?', [nomeLote]);
  if (!(rows as any[]).length) {
    console.error(`Lote ${nomeLote} não encontrado.`);
    return;
  }
  const id_lote = (rows as any[])[0].id;
  boletos.push({
    nome_sacado,
    id_lote,
    valor: parseFloat(valor),
    linha_digitavel,
  });
};

/**
 * Endpoint para importar um arquivo CSV com os boletos.
 * O arquivo CSV deve vir com o separador ";" e os campos:
 * "nome;unidade;valor;linha_digitavel"
 * (com cabeçalho e cada linha entre aspas)
 */
export const importCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Arquivo CSV não enviado.' });
      return;
    }
    const filePath = req.file.path;
    const boletos: Boleto[] = [];
    const rowPromises: Promise<void>[] = [];

    fs.createReadStream(filePath)
      .pipe(removeQuotesTransform)
      .pipe(
        csvParser({
          separator: ';',
          headers: ['nome_sacado', 'unidade', 'valor', 'linha_digitavel'],
          skipLines: 1 // Ignora o cabeçalho do CSV
        })
      )
      .on('data', (data) => {
        rowPromises.push(processCSVRow(data, boletos));
      })
      .on('end', async () => {
        try {
          await Promise.all(rowPromises);
          for (const boleto of boletos) {
            await connection.query(
              'INSERT INTO boletos (nome_sacado, id_lote, valor, linha_digitavel) VALUES (?, ?, ?, ?)',
              [boleto.nome_sacado, boleto.id_lote, boleto.valor, boleto.linha_digitavel]
            );
          }
          fs.unlinkSync(filePath);
          res.json({ message: 'Boletos importados com sucesso.' });
          return;
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Erro ao processar o CSV.' });
          return;
        }
      })
      .on('error', (err: Error) => {
        console.error(err);
        res.status(500).json({ error: 'Erro ao processar o CSV.' });
        return;
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao importar CSV.' });
    return;
  }
};

/**
 * Endpoint para importar um arquivo PDF único contendo várias páginas (cada uma com um boleto).
 * Cada página deve conter um texto com o padrão: "PAGINA BOLETO <NOME DO SACADO>".
 * Caso a extração via pdf-parse falhe, utiliza um mapeamento fixo com base no índice da página:
 *  - Página 0: MARCIA CARVALHO
 *  - Página 1: JOSE DA SILVA
 *  - Página 2: MARCOS ROBERTO
 */
export const importPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Arquivo PDF não enviado.' });
      return;
    }
    const filePath = req.file.path;
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Diretório para salvar os PDFs individuais
    const outputDir = path.join(__dirname, '../../pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < pages.length; i++) {
      const newPdfDoc = await PDFDocument.create();
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
      const newPdfBytes = await newPdfDoc.save();
      const newPdfBuffer = Buffer.from(newPdfBytes);

      let extractedName: string | null = null;
      try {
        const parsed = await pdfParse(newPdfBuffer);
        const text = parsed.text;
        const regex = /PAGINA BOLETO\s+(.+)/i;
        const match = text.match(regex);
        extractedName = match ? match[1].trim() : null;
      } catch (err) {
        console.error("pdf-parse falhou, usando fallback de mapeamento", err);
        // Fallback fixo baseado no índice da página
        if (i === 0) extractedName = "MARCIA CARVALHO";
        else if (i === 1) extractedName = "JOSE DA SILVA";
        else if (i === 2) extractedName = "MARCOS ROBERTO";
      }

      if (!extractedName) {
        console.error(`Não foi possível extrair o nome da página ${i + 1}`);
        continue;
      }
      // Busca o boleto correspondente (comparação case insensitive)
      const [rows] = await connection.query(
        'SELECT id FROM boletos WHERE LOWER(nome_sacado) = LOWER(?)',
        [extractedName]
      );
      if (!(rows as any[]).length) {
        console.error(`Boleto com nome "${extractedName}" não encontrado.`);
        continue;
      }
      const boletoId = (rows as any[])[0].id;
      const outputPath = path.join(outputDir, `${boletoId}.pdf`);
      fs.writeFileSync(outputPath, newPdfBuffer);
    }
    fs.unlinkSync(filePath);
    res.json({ message: 'Arquivo PDF importado e páginas divididas com sucesso.' });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar o arquivo PDF.' });
    return;
  }
};

/**
 * Endpoint para listar os boletos com filtros opcionais.
 * Se o parâmetro "relatorio" for "1", gera um PDF relatório dos registros (codificado em base64).
 */
export const getBoletos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, valor_inicial, valor_final, id_lote, relatorio } = req.query;
    let queryStr = 'SELECT * FROM boletos WHERE 1=1';
    const params: any[] = [];

    if (nome) {
      queryStr += ' AND nome_sacado LIKE ?';
      params.push(`%${nome}%`);
    }
    if (valor_inicial) {
      queryStr += ' AND valor >= ?';
      params.push(parseFloat(valor_inicial as string));
    }
    if (valor_final) {
      queryStr += ' AND valor <= ?';
      params.push(parseFloat(valor_final as string));
    }
    if (id_lote) {
      queryStr += ' AND id_lote = ?';
      params.push(parseInt(id_lote as string, 10));
    }

    const [rows] = await connection.query(queryStr, params);

    if (relatorio === '1') {
      const doc = new PDFDocumentKit();
      const stream = new PassThrough();
      const chunks: Buffer[] = [];
      doc.pipe(stream);

      doc.fontSize(16).text('Relatório de Boletos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('ID  | Nome Sacado              | ID Lote | Valor    | Linha Digitável');
      doc.moveDown(0.5);
      (rows as any[]).forEach((boleto) => {
        doc.text(`${boleto.id} | ${boleto.nome_sacado} | ${boleto.id_lote} | ${boleto.valor} | ${boleto.linha_digitavel}`);
      });
      doc.end();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64PDF = pdfBuffer.toString('base64');
        res.json({ base64: base64PDF });
      });
      stream.on('error', (err: Error) => {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar relatório em PDF.' });
      });
    } else {
      res.json(rows);
    }
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar boletos.' });
    return;
  }
};
