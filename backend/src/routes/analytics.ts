import express, { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { z } from 'zod';

const router = express.Router();
const analyticsService = new AnalyticsService();

// validação de data no formato YYYY-MM-DD
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// GET /api/analytics/metrics - métricas gerais de vendas
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
    }).parse(req.query);

    const metrics = await analyticsService.getSalesMetrics(params.startDate, params.endDate);
    return res.json(metrics);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar métricas' });
  }
});

// GET /api/analytics/sales-by-period - vendas agrupadas por período
router.get('/sales-by-period', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
      period: z.enum(['day', 'week', 'month']).optional(),
    }).parse(req.query);

    const period = params.period || 'day';
    const data = await analyticsService.getSalesByPeriod(
      params.startDate,
      params.endDate,
      period
    );
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar vendas por período' });
  }
});

// GET /api/analytics/top-products - lista produtos mais vendidos
router.get('/top-products', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
      limit: z.string().optional().transform((val: string) => {
        const num = parseInt(val);
        return isNaN(num) ? 10 : num;
      }),
    }).parse(req.query);

    const data = await analyticsService.getTopProducts(
      params.startDate, 
      params.endDate, 
      params.limit || 10
    );
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar top produtos' });
  }
});

// GET /api/analytics/products-by-channel-time - produtos por canal, dia e horário
router.get('/products-by-channel-time', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      channelId: z.string().transform((v: string) => parseInt(v)),
      dayOfWeek: z.string().transform((v: string) => parseInt(v)),
      startHour: z.string().transform((v: string) => parseInt(v)),
      endHour: z.string().transform((v: string) => parseInt(v)),
      limit: z.string().optional().transform((v: string) => v ? parseInt(v) : 10),
    }).parse(req.query);

    const data = await analyticsService.getProductsByChannelAndTime(
      params.channelId,
      params.dayOfWeek,
      params.startHour,
      params.endHour,
      params.limit || 10
    );
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar produtos' });
  }
});

// GET /api/analytics/delivery-performance - performance de entrega por região
router.get('/delivery-performance', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
    }).parse(req.query);

    const data = await analyticsService.getDeliveryPerformanceByRegion(
      params.startDate, 
      params.endDate
    );
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar performance de entrega' });
  }
});

// GET /api/analytics/inactive-customers - clientes recorrentes que estão inativos
router.get('/inactive-customers', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      daysInactive: z.string().optional().transform((v: string) => {
        const num = parseInt(v);
        return isNaN(num) ? 30 : num;
      }),
      minPurchases: z.string().optional().transform((v: string) => {
        const num = parseInt(v);
        return isNaN(num) ? 3 : num;
      }),
    }).parse(req.query);

    const data = await analyticsService.getInactiveRecurrentCustomers(
      params.daysInactive || 30,
      params.minPurchases || 3
    );
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar clientes inativos' });
  }
});

// GET /api/analytics/sales-by-channel - vendas agrupadas por canal
router.get('/sales-by-channel', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
    }).parse(req.query);

    const data = await analyticsService.getSalesByChannel(params.startDate, params.endDate);
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar vendas por canal' });
  }
});

// GET /api/analytics/sales-by-store - vendas agrupadas por loja
router.get('/sales-by-store', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
    }).parse(req.query);

    const data = await analyticsService.getSalesByStore(params.startDate, params.endDate);
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao buscar vendas por loja' });
  }
});

// POST /api/analytics/custom-query - executa query customizada
router.post('/custom-query', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    const data = await analyticsService.executeCustomQuery(config);
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Erro ao executar query' });
  }
});

export default router;

