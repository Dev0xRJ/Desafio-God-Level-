interface DeliveryPerformanceTableProps {
  data: Array<{
    neighborhood: string;
    city: string;
    deliveryCount: number;
    avgDeliveryMinutes: number;
    medianDeliveryMinutes: number;
    p90DeliveryMinutes: number;
  }>;
  loading?: boolean;
}

export default function DeliveryPerformanceTable({ data, loading }: DeliveryPerformanceTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum dado de entrega encontrado para o período.</div>;
  }


  const sortedData = [...data].sort((a, b) => b.avgDeliveryMinutes - a.avgDeliveryMinutes);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bairro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cidade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entregas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tempo Médio (min)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mediana (min)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              P90 (min)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <tr key={`${item.neighborhood}-${item.city}`} className={index < 5 ? 'bg-red-50' : 'hover:bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.neighborhood || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.city || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.deliveryCount.toLocaleString('pt-BR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.avgDeliveryMinutes.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.medianDeliveryMinutes.toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.p90DeliveryMinutes.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="bg-red-50 p-2 rounded">
            ⚠️ As 5 regiões destacadas em vermelho são as que têm pior performance de entrega.
          </p>
        </div>
      )}
    </div>
  );
}

