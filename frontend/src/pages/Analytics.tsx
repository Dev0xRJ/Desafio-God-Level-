import { useState, useEffect } from 'react';

interface ProductData {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  channel: string;
}

export default function Analytics() {
  const [selectedChannel, setSelectedChannel] = useState('Todos os Canais');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 7 dias');
  const [selectedAnalysis, setSelectedAnalysis] = useState('Produtos mais Vendidos');
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);

  const mockData = {
    all: [
      { id: 1, name: 'Pizza Margherita', sales: 127, revenue: 3810.00, channel: 'Todos' },
      { id: 2, name: 'Hambúrguer Artesanal', sales: 89, revenue: 2670.00, channel: 'Todos' },
      { id: 3, name: 'Lasanha Bolonhesa', sales: 73, revenue: 2190.00, channel: 'Todos' }
    ],
    ifood: [
      { id: 1, name: 'Pizza Margherita', sales: 85, revenue: 2550.00, channel: 'iFood' },
      { id: 2, name: 'Hambúrguer Artesanal', sales: 67, revenue: 2010.00, channel: 'iFood' }
    ]
  };

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      let data = mockData.all;
      if (selectedChannel === 'iFood') data = mockData.ifood;
      setProducts(data);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
  }, [selectedChannel, selectedPeriod, selectedAnalysis]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Avançado
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Análises detalhadas do seu restaurante com filtros personalizados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Vendas por Canal
            </h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-sm text-gray-500 mt-1">+12% vs período anterior</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filtros Avançados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canal de Vendas
              </label>
              <select 
                value={selectedChannel} 
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Todos os Canais</option>
                <option>iFood</option>
                <option>Uber Eats</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Período
              </label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Análise
              </label>
              <select 
                value={selectedAnalysis} 
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>Produtos mais Vendidos</option>
                <option>Horários de Pico</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Filtros ativos:</span> {selectedAnalysis}  {selectedChannel}  {selectedPeriod}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedAnalysis} - {selectedPeriod}
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Receita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Canal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {item.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.channel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
