import { AnalyticsService } from '../../src/services/analyticsService';
import pool from '../../src/config/database';

// Mock do pool de conexão
jest.mock('../../src/config/database', () => ({
  query: jest.fn()
}));

jest.mock('../../src/utils/cache', () => ({
  getCache: jest.fn(),
  setCache: jest.fn()
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getSalesMetrics', () => {
    it('deve retornar métricas de vendas corretas', async () => {
      const mockResult = [{
        amount_sum: '15000.50',
        amount_avg: '75.25',
        amount_count: '200'
      }];

      mockQuery.mockResolvedValueOnce({ rows: mockResult });

      const result = await analyticsService.getSalesMetrics('2024-01-01', '2024-01-31');

      expect(result).toEqual({
        totalRevenue: 15000.50,
        averageTicket: 75.25,
        totalSales: 200
      });
    });

    it('deve tratar erro quando query falha', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        analyticsService.getSalesMetrics('2024-01-01', '2024-01-31')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getTopProducts', () => {
    it('deve retornar lista de produtos mais vendidos', async () => {
      const mockResult = [
        { product_name: 'Pizza Margherita', total_quantity: 150, total_revenue: 2250.00 },
        { product_name: 'X-Burger Bacon', total_quantity: 120, total_revenue: 1800.00 }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockResult });

      const result = await analyticsService.getTopProducts('2024-01-01', '2024-01-31', 10);

      expect(result).toHaveLength(2);
      expect(result[0].product_name).toBe('Pizza Margherita');
      expect(result[0].total_quantity).toBe(150);
    });
  });
});