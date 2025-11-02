import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// rotas
import analyticsRoutes from './routes/analytics';
import metadataRoutes from './routes/metadata';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// middlewares básicos
app.use(cors());
app.use(express.json());

// healthcheck simples
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// rotas da API
app.use('/api/analytics', analyticsRoutes);
app.use('/api/metadata', metadataRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`API disponível em http://localhost:${port}/api/analytics`);
});

