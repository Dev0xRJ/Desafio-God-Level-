import { useEffect, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { analyticsApi } from '../services/api';
import MetricCard from '../components/MetricCard';
import SalesChart from '../components/SalesChart';
import TopProductsTable from '../components/TopProductsTable';
import SalesByChannelChart from '../components/SalesByChannelChart';
import DateRangePicker from '../components/DateRangePicker';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

export default function Dashboard() {
  const hoje = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(hoje), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(hoje), 'yyyy-MM-dd'));
  
  const [metrics, setMetrics] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesByChannel, setSalesByChannel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // carrega dados em paralelo
      const [metricsData, salesDataRes, topProductsRes, channelData] = await Promise.all([
        analyticsApi.getMetrics(startDate, endDate),
        analyticsApi.getSalesByPeriod(startDate, endDate, 'day'),
        analyticsApi.getTopProducts(startDate, endDate, 10),
        analyticsApi.getSalesByChannel(startDate, endDate),
      ]);

      setMetrics(metricsData);
      setSalesData(salesDataRes);
      setTopProducts(topProductsRes);
      setSalesByChannel(channelData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      
      // Dados mockados para demonstração
      const mockMetrics = {
        totalRevenue: 125430.50,
        totalOrders: 1847,
        averageTicket: 67.91,
        activeCustomers: 432
      };
      
      const mockSalesData = [
        { date: '2025-11-01', revenue: 4250.00, orders: 65 },
        { date: '2025-11-02', revenue: 3890.50, orders: 58 },
        { date: '2025-11-03', revenue: 4520.75, orders: 72 },
        { date: '2025-11-04', revenue: 3750.25, orders: 54 },
        { date: '2025-11-05', revenue: 4125.80, orders: 63 },
        { date: '2025-11-06', revenue: 4680.30, orders: 71 },
        { date: '2025-11-07', revenue: 5200.15, orders: 78 }
      ];
      
      const mockTopProducts = [
        { id: 1, name: 'Pizza Margherita', salesCount: 156, totalRevenue: 4680.00 },
        { id: 2, name: 'Hambúrguer Artesanal', salesCount: 142, totalRevenue: 3408.00 },
        { id: 3, name: 'Lasanha Bolonhesa', salesCount: 98, totalRevenue: 2940.00 },
        { id: 4, name: 'Salmão Grelhado', salesCount: 87, totalRevenue: 3480.00 },
        { id: 5, name: 'Risotto de Camarão', salesCount: 76, totalRevenue: 3040.00 }
      ];
      
      const mockChannelData = [
        { name: 'iFood', revenue: 45230.50, orders: 678 },
        { name: 'Uber Eats', revenue: 32150.25, orders: 485 },
        { name: 'Rappi', revenue: 28950.75, orders: 412 },
        { name: 'Balcão', revenue: 19099.00, orders: 272 }
      ];
      
      setMetrics(mockMetrics);
      setSalesData(mockSalesData);
      setTopProducts(mockTopProducts);
      setSalesByChannel(mockChannelData);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDateRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleQuickDateRange(7)}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Últimos 7 dias
        </button>
        <button
          onClick={() => handleQuickDateRange(30)}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Últimos 30 dias
        </button>
        <button
          onClick={() => handleQuickDateRange(90)}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Últimos 90 dias
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Faturamento Total"
            value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend={null}
          />
          <MetricCard
            title="Ticket Médio"
            value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            trend={null}
          />
          <MetricCard
            title="Total de Vendas"
            value={metrics.totalSales.toLocaleString('pt-BR')}
            icon={ShoppingCart}
            trend={null}
          />
          <MetricCard
            title="Período"
            value={`${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`}
            icon={Users}
            trend={null}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Vendas ao Longo do Tempo</h3>
          <SalesChart data={salesData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Vendas por Canal</h3>
          <SalesByChannelChart data={salesByChannel} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top 10 Produtos Mais Vendidos</h3>
        <TopProductsTable products={topProducts} />
      </div>
    </div>
  );
}

