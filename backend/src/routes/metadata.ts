import express, { Request, Response } from 'express';
import pool from '../config/database';
import { getCache, setCache } from '../utils/cache';

const router = express.Router();


router.get('/stores', async (req: Request, res: Response) => {
  try {
    const cached = getCache('metadata_stores');
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT id, name, city, state, is_active
      FROM stores
      WHERE is_active = true
      ORDER BY name
    `);

    const data = result.rows;
    setCache('metadata_stores', data, 3600);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/channels', async (req: Request, res: Response) => {
  try {
    const cached = getCache('metadata_channels');
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT id, name, type, description
      FROM channels
      ORDER BY name
    `);

    const data = result.rows;
    setCache('metadata_channels', data, 3600);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/products', async (req: Request, res: Response) => {
  try {
    const { limit, search } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 100;

    let query = `
      SELECT id, name
      FROM products
      WHERE deleted_at IS NULL
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY name LIMIT $${params.length + 1}`;
    params.push(limitNum);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/categories', async (req: Request, res: Response) => {
  try {
    const cached = getCache('metadata_categories');
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT id, name, type
      FROM categories
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    const data = result.rows;
    setCache('metadata_categories', data, 3600);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/date-range', async (req: Request, res: Response) => {
  try {
    const cached = getCache('metadata_date_range');
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT 
        MIN(created_at) as min_date,
        MAX(created_at) as max_date
      FROM sales
      WHERE sale_status_desc = 'COMPLETED'
    `);

    const data = {
      minDate: result.rows[0]?.min_date || new Date(),
      maxDate: result.rows[0]?.max_date || new Date(),
    };

    setCache('metadata_date_range', data, 3600);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

