const PDFDocument = require('pdfkit');
const fs = require('fs');

// Cria um novo documento PDF sem compressão
const doc = new PDFDocument({ compress: false });

// Cria um fluxo de escrita para gerar o arquivo "boletos.pdf" na raiz do projeto
doc.pipe(fs.createWriteStream('boletos.pdf'));

// Página 1: Deve conter o boleto de MARCIA CARVALHO
doc.fontSize(20)
   .text("PAGINA BOLETO MARCIA CARVALHO", { align: "center" });
doc.addPage();

// Página 2: Deve conter o boleto de JOSE DA SILVA
doc.fontSize(20)
   .text("PAGINA BOLETO JOSE DA SILVA", { align: "center" });
doc.addPage();

// Página 3: Deve conter o boleto de MARCOS ROBERTO
doc.fontSize(20)
   .text("PAGINA BOLETO MARCOS ROBERTO", { align: "center" });

// Finaliza e salva o PDF
doc.end();
