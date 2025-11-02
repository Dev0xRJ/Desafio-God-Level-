import { Pool } from 'pg';

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  value: any;
}

export interface QueryConfig {
  table: string;
  select: string[];
  filters?: QueryFilter[];
  groupBy?: string[];
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  aggregations?: { field: string; function: 'sum' | 'avg' | 'count' | 'min' | 'max' }[];
}

const FIELD_MAP: Record<string, string> = {
  'store': 's.store_id',
  'channel': 's.channel_id',
  'product': 'ps.product_id',
  'customer': 's.customer_id',
  'date': 's.created_at',
  'amount': 's.total_amount',
  'status': 's.sale_status_desc',
};

export class QueryBuilder {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  buildQuery(config: QueryConfig): { sql: string; params: any[] } {
    const params: any[] = [];
    let paramIndex = 1;

    // monta o SELECT
    let selectClause = '';
    if (config.aggregations && config.aggregations.length > 0) {
      const aggs = config.aggregations.map(agg => {
        const func = agg.function.toUpperCase();
        const field = this.mapField(agg.field);
        return `${func}(${field}) as ${agg.field}_${agg.function}`;
      }).join(', ');
      
      if (config.select.length > 0) {
        const selects = config.select.map(f => this.mapField(f)).join(', ');
        selectClause = `${selects}, ${aggs}`;
      } else {
        selectClause = aggs;
      }
    } else {
      selectClause = config.select.map(f => this.mapField(f)).join(', ');
    }

    // monta o FROM com os joins necessários
    const fromClause = this.buildFromClause(config.table);

    // monta o WHERE
    const whereClause = this.buildWhereClause(config.filters || [], params, paramIndex);
    paramIndex = params.length + 1;

    // GROUP BY se necessário
    let groupByClause = '';
    if (config.groupBy && config.groupBy.length > 0) {
      groupByClause = `GROUP BY ${config.groupBy.map(f => this.mapField(f)).join(', ')}`;
    }

    // ORDER BY se necessário
    let orderByClause = '';
    if (config.orderBy) {
      const dir = config.orderBy.direction.toUpperCase();
      orderByClause = `ORDER BY ${this.mapField(config.orderBy.field)} ${dir}`;
    }

    // LIMIT se necessário
    let limitClause = '';
    if (config.limit) {
      limitClause = `LIMIT $${paramIndex}`;
      params.push(config.limit);
    }

    const sql = `
      SELECT ${selectClause}
      FROM ${fromClause}
      ${whereClause}
      ${groupByClause}
      ${orderByClause}
      ${limitClause}
    `.trim().replace(/\s+/g, ' ');

    return { sql, params };
  }

  private buildFromClause(table: string): string {
    const tableMap: Record<string, string> = {
      'sales': `
        sales s
        LEFT JOIN stores st ON st.id = s.store_id
        LEFT JOIN channels ch ON ch.id = s.channel_id
        LEFT JOIN customers c ON c.id = s.customer_id
      `,
      'products': `
        product_sales ps
        JOIN sales s ON s.id = ps.sale_id
        JOIN products p ON p.id = ps.product_id
        LEFT JOIN stores st ON st.id = s.store_id
        LEFT JOIN channels ch ON ch.id = s.channel_id
      `,
      'delivery': `
        sales s
        JOIN delivery_sales ds ON ds.sale_id = s.id
        JOIN delivery_addresses da ON da.sale_id = s.id
        LEFT JOIN stores st ON st.id = s.store_id
        LEFT JOIN channels ch ON ch.id = s.channel_id
      `,
      'customers': `
        sales s
        JOIN customers c ON c.id = s.customer_id
        LEFT JOIN stores st ON st.id = s.store_id
      `,
    };

    return tableMap[table] || table;
  }

  private buildWhereClause(filters: QueryFilter[], params: any[], startIndex: number): string {
    // Sempre filtrar por vendas completadas
    params.push('COMPLETED');
    let paramIndex = startIndex;
    
    if (filters.length === 0) return 'WHERE s.sale_status_desc = $1';
    
    paramIndex = startIndex + 1;
    const conditions = filters.map(filter => {
      const field = this.mapField(filter.field);
      let condition = '';

      switch (filter.operator) {
        case 'eq':
          condition = `${field} = $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'ne':
          condition = `${field} != $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'gt':
          condition = `${field} > $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'gte':
          condition = `${field} >= $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'lt':
          condition = `${field} < $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'lte':
          condition = `${field} <= $${paramIndex}`;
          params.push(filter.value);
          break;
        case 'in':
          const placeholders = filter.value.map((_: any, i: number) => `$${paramIndex + i}`).join(', ');
          condition = `${field} IN (${placeholders})`;
          params.push(...filter.value);
          paramIndex += filter.value.length;
          return condition;
        case 'like':
          condition = `${field} ILIKE $${paramIndex}`;
          params.push(`%${filter.value}%`);
          break;
        case 'between':
          condition = `${field} BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
          params.push(filter.value[0], filter.value[1]);
          paramIndex += 1;
          break;
      }

      paramIndex += 1;
      return condition;
    });

    return `WHERE s.sale_status_desc = $1 AND ${conditions.join(' AND ')}`;
  }

  private mapField(field: string): string {
    return FIELD_MAP[field] || field;
  }

  async execute(config: QueryConfig): Promise<any[]> {
    const { sql, params } = this.buildQuery(config);
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}

