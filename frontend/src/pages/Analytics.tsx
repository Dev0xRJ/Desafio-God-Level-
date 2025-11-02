import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
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
    }
  };

  const loadDeliveryPerformance = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.getDeliveryPerformance(startDate, endDate);
      setDeliveryPerformance(data);
    } catch (error) {
      console.error('Error loading delivery performance:', error);
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
        <p className="text-sm text-gray-600 mb-4">
          Respondendo: "Qual produto vende mais na quinta à noite no iFood?"
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
            <select
              value={selectedChannelId || ''}
              onChange={(e) => setSelectedChannelId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
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
              onChange={(e) => setSelectedDayOfWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <input
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário Final</label>
            <input
              type="number"
              min="0"
              max="23"
              value={endHour}
              onChange={(e) => setEndHour(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
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

