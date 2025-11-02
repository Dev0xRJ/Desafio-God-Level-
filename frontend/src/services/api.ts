import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SalesMetrics {
  totalRevenue: number;
  averageTicket: number;
  totalSales: number;
}

export interface SalesByPeriod {
  period: string;
  revenue: number;
  sales: number;
}

export interface TopProduct {
  id: number;
  name: string;
  salesCount: number;
  totalRevenue: number;
  totalQuantity: number;
  avgPrice: number;
}

export interface DeliveryPerformance {
  neighborhood: string;
  city: string;
  deliveryCount: number;
  avgDeliveryMinutes: number;
  medianDeliveryMinutes: number;
  p90DeliveryMinutes: number;
}

export interface InactiveCustomer {
  id: number;
  name: string;
  email: string;
  purchaseCount: number;
  lastPurchase: string;
  totalSpent: number;
  avgTicket: number;
  daysInactive: number;
}

export interface SalesByChannel {
  id: number;
  name: string;
  salesCount: number;
  totalRevenue: number;
  avgTicket: number;
}

export interface SalesByStore {
  id: number;
  name: string;
  city: string;
  salesCount: number;
  totalRevenue: number;
  avgTicket: number;
}

export const analyticsApi = {
  getMetrics: async (startDate: string, endDate: string): Promise<SalesMetrics> => {
    const response = await api.get('/analytics/metrics', { params: { startDate, endDate } });
    return response.data;
  },

  getSalesByPeriod: async (
    startDate: string, 
    endDate: string, 
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<SalesByPeriod[]> => {
    const response = await api.get('/analytics/sales-by-period', { 
      params: { startDate, endDate, period } 
    });
    return response.data;
  },

  getTopProducts: async (
    startDate: string, 
    endDate: string, 
    limit: number = 10
  ): Promise<TopProduct[]> => {
    const response = await api.get('/analytics/top-products', { 
      params: { startDate, endDate, limit } 
    });
    return response.data;
  },

  getProductsByChannelTime: async (
    channelId: number,
    dayOfWeek: number,
    startHour: number,
    endHour: number,
    limit: number = 10
  ): Promise<TopProduct[]> => {
    const response = await api.get('/analytics/products-by-channel-time', {
      params: { channelId, dayOfWeek, startHour, endHour, limit },
    });
    return response.data;
  },

  getDeliveryPerformance: async (
    startDate: string, 
    endDate: string
  ): Promise<DeliveryPerformance[]> => {
    const response = await api.get('/analytics/delivery-performance', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getInactiveCustomers: async (
    daysInactive: number = 30, 
    minPurchases: number = 3
  ): Promise<InactiveCustomer[]> => {
    const response = await api.get('/analytics/inactive-customers', { 
      params: { daysInactive, minPurchases } 
    });
    return response.data;
  },

  getSalesByChannel: async (
    startDate: string, 
    endDate: string
  ): Promise<SalesByChannel[]> => {
    const response = await api.get('/analytics/sales-by-channel', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getSalesByStore: async (
    startDate: string, 
    endDate: string
  ): Promise<SalesByStore[]> => {
    const response = await api.get('/analytics/sales-by-store', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },
};

export const metadataApi = {
  getStores: async () => {
    const response = await api.get('/metadata/stores');
    return response.data;
  },
  
  getChannels: async () => {
    const response = await api.get('/metadata/channels');
    return response.data;
  },
  
  getProducts: async (limit?: number, search?: string) => {
    const response = await api.get('/metadata/products', { 
      params: { limit, search } 
    });
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/metadata/categories');
    return response.data;
  },
  
  getDateRange: async () => {
    const response = await api.get('/metadata/date-range');
    return response.data;
  },
};

export default api;

