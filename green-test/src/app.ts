import express from 'express';
import dotenv from 'dotenv';
import boletoRoutes from './routes/boleto.routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/boletos', boletoRoutes);

export default app;
