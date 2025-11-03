import { useEffect, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { analyticsApi, metadataApi } from '../services/api';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading && !metrics) {
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

