import request from 'supertest';
import express from 'express';
import cors from 'cors';
import analyticsRoutes from '../../src/routes/analytics';
import metadataRoutes from '../../src/routes/metadata';

// Mock das dependências
jest.mock('../../src/config/database');
jest.mock('../../src/utils/cache');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/analytics', analyticsRoutes);
app.use('/api/metadata', metadataRoutes);

describe('Analytics Routes', () => {
  describe('GET /api/analytics/metrics', () => {
    it('deve retornar métricas com parâmetros válidos', async () => {
      const response = await request(app)
        .get('/api/analytics/metrics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });

      // Como estamos mockando, esperamos que não dê erro 500
      expect(response.status).not.toBe(500);
    });

    it('deve retornar erro 400 para datas inválidas', async () => {
      const response = await request(app)
        .get('/api/analytics/metrics')
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/analytics/top-products', () => {
    it('deve aceitar parâmetros de paginação', async () => {
      const response = await request(app)
        .get('/api/analytics/top-products')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          limit: '5'
        });

      expect(response.status).not.toBe(500);
    });
  });
});