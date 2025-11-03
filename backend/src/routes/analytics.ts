import express, { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { z } from 'zod';

const router = express.Router();
const analyticsService = new AnalyticsService();

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);


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


router.get('/top-products', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      startDate: dateSchema,
      endDate: dateSchema,
      limit: z.string().optional().transform((val: string | undefined) => {
        if (!val) return 10;
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


router.get('/products-by-channel-time', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      channelId: z.string().transform((v: string) => parseInt(v)),
      dayOfWeek: z.string().transform((v: string) => parseInt(v)),
      startHour: z.string().transform((v: string) => parseInt(v)),
      endHour: z.string().transform((v: string) => parseInt(v)),
      limit: z.string().optional().transform((v: string | undefined) => v ? parseInt(v) : 10),
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


router.get('/inactive-customers', async (req: Request, res: Response) => {
  try {
    const params = z.object({
      daysInactive: z.string().optional().transform((v: string | undefined) => {
        if (!v) return 30;
        const num = parseInt(v);
        return isNaN(num) ? 30 : num;
      }),
      minPurchases: z.string().optional().transform((v: string | undefined) => {
        if (!v) return 3;
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

