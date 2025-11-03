import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { analyticsApi } from '../services/api';
import DateRangePicker from '../components/DateRangePicker';
import DeliveryPerformanceTable from '../components/DeliveryPerformanceTable';
import InactiveCustomersTable from '../components/InactiveCustomersTable';
import ProductsByChannelTimeTable from '../components/ProductsByChannelTimeTable';
import { metadataApi } from '../services/api';

export default function Analytics() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  
  const [deliveryPerformance, setDeliveryPerformance] = useState<any[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<any[]>([]);
  const [productsByChannelTime, setProductsByChannelTime] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  
  // Filtros para produtos por canal/horário
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(4); // Quinta-feira
  const [startHour, setStartHour] = useState<number>(19); // 19h (noite)
  const [endHour, setEndHour] = useState<number>(23); // 23h

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    loadDeliveryPerformance();
    loadInactiveCustomers();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedChannelId !== null) {
      loadProductsByChannelTime();
    }
  }, [selectedChannelId, selectedDayOfWeek, startHour, endHour]);

  const loadChannels = async () => {
    try {
      const data = await metadataApi.getChannels();
      setChannels(data);
      if (data.length > 0) {
        setSelectedChannelId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      // Fallback com dados de exemplo
      const mockChannels = [
        { id: 1, name: 'iFood', type: 'delivery' },
        { id: 2, name: 'Uber Eats', type: 'delivery' },
        { id: 3, name: 'Rappi', type: 'delivery' },
        { id: 4, name: 'Balcão', type: 'presencial' },
        { id: 5, name: 'WhatsApp', type: 'takeaway' }
      ];
      setChannels(mockChannels);
      setSelectedChannelId(mockChannels[0].id);
      console.log('Canais mockados carregados:', mockChannels);
    }
  };

  const loadDeliveryPerformance = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getDeliveryPerformance(startDate, endDate);
      setDeliveryPerformance(data);
    } catch (error) {
      console.error('Error loading delivery performance:', error);
      
      // Dados mockados para demonstração
      const mockDeliveryData = [
        { region: 'Centro', avgTime: 28, medianTime: 25, p90Time: 35, totalDeliveries: 1250 },
        { region: 'Zona Sul', avgTime: 32, medianTime: 30, p90Time: 42, totalDeliveries: 980 },
        { region: 'Zona Norte', avgTime: 35, medianTime: 33, p90Time: 45, totalDeliveries: 850 },
        { region: 'Zona Oeste', avgTime: 38, medianTime: 36, p90Time: 48, totalDeliveries: 720 },
        { region: 'Subúrbio', avgTime: 42, medianTime: 40, p90Time: 55, totalDeliveries: 450 }
      ];
      
      setDeliveryPerformance(mockDeliveryData);
    } finally {
      setLoading(false);
    }
  };

  const loadInactiveCustomers = async () => {
    try {
      const data = await analyticsApi.getInactiveCustomers(30, 3);
      setInactiveCustomers(data);
    } catch (error) {
      console.error('Error loading inactive customers:', error);
      
      // Dados mockados para demonstração
      const mockInactiveCustomers = [
        { id: 1, name: 'Maria Silva', email: 'maria.silva@email.com', lastOrderDate: '2024-09-15', daysSinceLastOrder: 48, totalOrders: 15, totalSpent: 450.00 },
        { id: 2, name: 'João Santos', email: 'joao.santos@email.com', lastOrderDate: '2024-09-20', daysSinceLastOrder: 43, totalOrders: 22, totalSpent: 680.50 },
        { id: 3, name: 'Ana Costa', email: 'ana.costa@email.com', lastOrderDate: '2024-09-25', daysSinceLastOrder: 38, totalOrders: 8, totalSpent: 320.00 },
        { id: 4, name: 'Carlos Lima', email: 'carlos.lima@email.com', lastOrderDate: '2024-09-28', daysSinceLastOrder: 35, totalOrders: 12, totalSpent: 540.75 },
        { id: 5, name: 'Lucia Ferreira', email: 'lucia.ferreira@email.com', lastOrderDate: '2024-10-01', daysSinceLastOrder: 32, totalOrders: 18, totalSpent: 720.25 }
      ];
      
      setInactiveCustomers(mockInactiveCustomers);
    }
  };

  const loadProductsByChannelTime = async () => {
    if (selectedChannelId === null) return;
    
    try {
      const data = await analyticsApi.getProductsByChannelTime(
        selectedChannelId,
        selectedDayOfWeek,
        startHour,
        endHour,
        10
      );
      setProductsByChannelTime(data);
    } catch (error) {
      console.error('Error loading products by channel time:', error);
      
      // Dados mockados para demonstração
      const mockProducts = [
        { id: 1, name: 'Pizza Margherita', salesCount: 45, totalRevenue: 1350.00 },
        { id: 2, name: 'Hambúrguer Artesanal', salesCount: 38, totalRevenue: 912.00 },
        { id: 3, name: 'Lasanha Bolonhesa', salesCount: 32, totalRevenue: 960.00 },
        { id: 4, name: 'Salmão Grelhado', salesCount: 28, totalRevenue: 1120.00 },
        { id: 5, name: 'Risotto de Camarão', salesCount: 25, totalRevenue: 1000.00 },
        { id: 6, name: 'Frango à Parmegiana', salesCount: 23, totalRevenue: 690.00 },
        { id: 7, name: 'Pasta Carbonara', salesCount: 20, totalRevenue: 560.00 },
        { id: 8, name: 'Picanha Grelhada', salesCount: 18, totalRevenue: 720.00 },
        { id: 9, name: 'Sushi Combinado', salesCount: 15, totalRevenue: 675.00 },
        { id: 10, name: 'Brownie com Sorvete', salesCount: 12, totalRevenue: 180.00 }
      ];
      
      setProductsByChannelTime(mockProducts);
    }
  };

  const daysOfWeek = [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Análises Avançadas</h2>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Produtos Mais Vendidos por Canal e Horário
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Consulta atual:</span> "Qual produto vende mais {selectedChannelId ? `no ${channels.find(c => c.id === selectedChannelId)?.name}` : ''} na {daysOfWeek[selectedDayOfWeek].toLowerCase()} das {String(startHour).padStart(2, '0')}h às {String(endHour).padStart(2, '0')}h?"
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
            <select
              value={selectedChannelId || ''}
              onChange={(e) => setSelectedChannelId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
            >
              <option value="">Selecione um canal</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
            <select
              value={selectedDayOfWeek}
              onChange={(e) => setSelectedDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário Inicial</label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário Final</label>
            <select
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm bg-white"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <ProductsByChannelTimeTable products={productsByChannelTime} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Performance de Entrega por Região
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Respondendo: "Meu tempo de entrega piorou. Em quais regiões?"
        </p>
        <DeliveryPerformanceTable data={deliveryPerformance} loading={loading} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          Clientes Recorrentes Inativos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Respondendo: "Quais clientes compraram 3+ vezes mas não voltam há 30 dias?"
        </p>
        <InactiveCustomersTable customers={inactiveCustomers} />
      </div>
    </div>
  );
}

