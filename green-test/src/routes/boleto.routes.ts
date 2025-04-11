import { Router } from 'express';
import multer from 'multer';
import { query } from 'express-validator';
import { importCSV, importPDF, getBoletos } from '../controllers/boleto.controller';
import { validate } from '../middlewares/validations';
import { validateFileExtension } from '../middlewares/fileValidation';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Endpoint para importar arquivo CSV
// – Valida se o arquivo foi enviado e se sua extensão é .csv
router.post(
  '/csv',
  upload.single('file'),
  validateFileExtension([".csv"]),
  importCSV
);

// Endpoint para importar arquivo PDF
// – Valida se o arquivo foi enviado e se a extensão é .pdf
router.post(
  '/pdf',
  upload.single('file'),
  validateFileExtension([".pdf"]),
  importPDF
);

// Endpoint para listar boletos e gerar relatório
router.get(
  '/',
  [
    query('nome').optional().isString(),
    query('valor_inicial').optional().isFloat({ gt: 0 }),
    query('valor_final').optional().isFloat({ gt: 0 }),
    query('id_lote').optional().isInt({ gt: 0 }),
    query('relatorio').optional().isIn(['0', '1'])
  ],
  validate,
  getBoletos
);

export default router;
