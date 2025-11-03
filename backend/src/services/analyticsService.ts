import pool from '../config/database';
import { QueryBuilder, QueryConfig } from './queryBuilder';
import { getCache, setCache } from '../utils/cache';

export class AnalyticsService {
  private queryBuilder: QueryBuilder;

  constructor() {
    this.queryBuilder = new QueryBuilder(pool);
  }

  private getCacheKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  async getSalesMetrics(startDate: string, endDate: string, filters?: any) {
    const cacheKey = this.getCacheKey('sales_metrics', { startDate, endDate, filters });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const config: QueryConfig = {
      table: 'sales',
      select: [],
      filters: [
        { field: 'date', operator: 'gte', value: startDate },
        { field: 'date', operator: 'lte', value: endDate },
        ...(filters || [])
      ],
      aggregations: [
        { field: 'amount', function: 'sum' },
        { field: 'amount', function: 'avg' },
        { field: 'amount', function: 'count' },
      ],
    };

    const result = await this.queryBuilder.execute(config);
    const metrics = result[0] || {};

    const data = {
      totalRevenue: parseFloat(metrics.amount_sum || 0),
      averageTicket: parseFloat(metrics.amount_avg || 0),
      totalSales: parseInt(metrics.amount_count || 0),
    };

    setCache(cacheKey, data);
    return data;
  }

  async getSalesByPeriod(startDate: string, endDate: string, period: 'day' | 'week' | 'month', filters?: any) {
    const cacheKey = this.getCacheKey('sales_by_period', { startDate, endDate, period, filters });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    let dateTrunc = 'day';
    if (period === 'week') {
      dateTrunc = 'week';
    } else if (period === 'month') {
      dateTrunc = 'month';
    }

    const config: QueryConfig = {
      table: 'sales',
      select: [`DATE_TRUNC('${dateTrunc}', s.created_at) as period`],
      filters: [
        { field: 'date', operator: 'gte', value: startDate },
        { field: 'date', operator: 'lte', value: endDate },
        ...(filters || [])
      ],
      groupBy: ['period'],
      aggregations: [
        { field: 'amount', function: 'sum' },
        { field: 'amount', function: 'count' },
      ],
      orderBy: { field: 'period', direction: 'asc' },
    };

    const result = await this.queryBuilder.execute(config);
    const data = result.map(row => ({
      period: row.period,
      revenue: parseFloat(row.amount_sum || 0),
      sales: parseInt(row.amount_count || 0),
    }));

    setCache(cacheKey, data);
    return data;
  }

  async getTopProducts(startDate: string, endDate: string, limit: number = 10, filters?: any) {
    const cacheKey = this.getCacheKey('top_products', { startDate, endDate, limit, filters });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        COUNT(*) as sales_count,
        SUM(ps.total_price) as total_revenue,
        SUM(ps.quantity) as total_quantity,
        AVG(ps.total_price) as avg_price
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      JOIN sales s ON s.id = ps.sale_id
      WHERE s.sale_status_desc = 'COMPLETED'
        AND s.created_at >= $1
        AND s.created_at <= $2
      GROUP BY p.id, p.name
      ORDER BY sales_count DESC
      LIMIT $3
    `, [startDate, endDate, limit]);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      salesCount: parseInt(row.sales_count),
      totalRevenue: parseFloat(row.total_revenue),
      totalQuantity: parseFloat(row.total_quantity),
      avgPrice: parseFloat(row.avg_price),
    }));

    setCache(cacheKey, data);
    return data;
  }

  async getProductsByChannelAndTime(
    channelId: number,
    dayOfWeek: number,
    startHour: number,
    endHour: number,
    limit: number = 10
  ) {
    const cacheKey = this.getCacheKey('products_channel_time', { channelId, dayOfWeek, startHour, endHour, limit });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        COUNT(*) as sales_count,
        SUM(ps.total_price) as total_revenue
      FROM product_sales ps
      JOIN products p ON p.id = ps.product_id
      JOIN sales s ON s.id = ps.sale_id
      WHERE s.sale_status_desc = 'COMPLETED'
        AND s.channel_id = $1
        AND EXTRACT(DOW FROM s.created_at) = $2
        AND EXTRACT(HOUR FROM s.created_at) >= $3
        AND EXTRACT(HOUR FROM s.created_at) < $4
      GROUP BY p.id, p.name
      ORDER BY sales_count DESC
      LIMIT $5
    `, [channelId, dayOfWeek, startHour, endHour, limit]);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      salesCount: parseInt(row.sales_count),
      totalRevenue: parseFloat(row.total_revenue),
    }));

    setCache(cacheKey, data);
    return data;
  }

  async getDeliveryPerformanceByRegion(startDate: string, endDate: string) {
    const cacheKey = this.getCacheKey('delivery_performance', { startDate, endDate });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(`
      SELECT 
        da.neighborhood,
        da.city,
        COUNT(*) as delivery_count,
        AVG(s.delivery_seconds / 60.0) as avg_delivery_minutes,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY s.delivery_seconds / 60.0) as median_delivery_minutes,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY s.delivery_seconds / 60.0) as p90_delivery_minutes
      FROM sales s
      JOIN delivery_addresses da ON da.sale_id = s.id
      WHERE s.sale_status_desc = 'COMPLETED'
        AND s.delivery_seconds IS NOT NULL
        AND s.created_at >= $1
        AND s.created_at <= $2
      GROUP BY da.neighborhood, da.city
      HAVING COUNT(*) >= 5
      ORDER BY avg_delivery_minutes DESC
    `, [startDate, endDate]);

    const data = result.rows.map(row => ({
      neighborhood: row.neighborhood,
      city: row.city,
      deliveryCount: parseInt(row.delivery_count),
      avgDeliveryMinutes: parseFloat(row.avg_delivery_minutes || 0),
      medianDeliveryMinutes: parseFloat(row.median_delivery_minutes || 0),
      p90DeliveryMinutes: parseFloat(row.p90_delivery_minutes || 0),
    }));

    setCache(cacheKey, data);
    return data;
  }


  async getInactiveRecurrentCustomers(daysInactive: number = 30, minPurchases: number = 3) {
    const cacheKey = this.getCacheKey('inactive_customers', { daysInactive, minPurchases });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(`
      WITH customer_stats AS (
        SELECT 
          c.id,
          c.customer_name,
          c.email,
          COUNT(DISTINCT s.id) as purchase_count,
          MAX(s.created_at) as last_purchase,
          SUM(s.total_amount) as total_spent,
          AVG(s.total_amount) as avg_ticket
        FROM customers c
        JOIN sales s ON s.customer_id = c.id
        WHERE s.sale_status_desc = 'COMPLETED'
        GROUP BY c.id, c.customer_name, c.email
        HAVING COUNT(DISTINCT s.id) >= $1
      )
      SELECT *
      FROM customer_stats
      WHERE last_purchase < NOW() - INTERVAL '${daysInactive} days'
      ORDER BY last_purchase ASC, purchase_count DESC
      LIMIT 100
    `, [minPurchases]);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.customer_name,
      email: row.email,
      purchaseCount: parseInt(row.purchase_count),
      lastPurchase: row.last_purchase,
      totalSpent: parseFloat(row.total_spent),
      avgTicket: parseFloat(row.avg_ticket),
      daysInactive: Math.floor((new Date().getTime() - new Date(row.last_purchase).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    setCache(cacheKey, data);
    return data;
  }


  async getSalesByChannel(startDate: string, endDate: string) {
    const cacheKey = this.getCacheKey('sales_by_channel', { startDate, endDate });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(`
      SELECT 
        ch.id,
        ch.name,
        COUNT(*) as sales_count,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_ticket
      FROM sales s
      JOIN channels ch ON ch.id = s.channel_id
      WHERE s.sale_status_desc = 'COMPLETED'
        AND s.created_at >= $1
        AND s.created_at <= $2
      GROUP BY ch.id, ch.name
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      salesCount: parseInt(row.sales_count),
      totalRevenue: parseFloat(row.total_revenue),
      avgTicket: parseFloat(row.avg_ticket),
    }));

    setCache(cacheKey, data);
    return data;
  }


  async getSalesByStore(startDate: string, endDate: string) {
    const cacheKey = this.getCacheKey('sales_by_store', { startDate, endDate });
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await pool.query(`
      SELECT 
        st.id,
        st.name,
        st.city,
        COUNT(*) as sales_count,
        SUM(s.total_amount) as total_revenue,
        AVG(s.total_amount) as avg_ticket
      FROM sales s
      JOIN stores st ON st.id = s.store_id
      WHERE s.sale_status_desc = 'COMPLETED'
        AND s.created_at >= $1
        AND s.created_at <= $2
      GROUP BY st.id, st.name, st.city
      ORDER BY total_revenue DESC
    `, [startDate, endDate]);

    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      city: row.city,
      salesCount: parseInt(row.sales_count),
      totalRevenue: parseFloat(row.total_revenue),
      avgTicket: parseFloat(row.avg_ticket),
    }));

    setCache(cacheKey, data);
    return data;
  }


  async executeCustomQuery(config: QueryConfig) {
    return this.queryBuilder.execute(config);
  }
}

