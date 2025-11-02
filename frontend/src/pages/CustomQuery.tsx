import { useState } from 'react';
import axios from 'axios';
import { BarChart3 } from 'lucide-react';

export default function CustomQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/analytics/custom-query', JSON.parse(query));
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao executar query');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const exampleQuery = {
    table: 'sales',
    select: ['s.created_at', 'st.name'],
    filters: [
      { field: 'date', operator: 'gte', value: '2024-01-01' },
      { field: 'date', operator: 'lte', value: '2024-12-31' },
    ],
    groupBy: ['st.name'],
    aggregations: [
      { field: 'amount', function: 'sum' },
      { field: 'amount', function: 'count' },
    ],
    orderBy: { field: 'amount', direction: 'desc' },
    limit: 10,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Query Builder</h2>
        <p className="text-gray-600 mt-2">
          Crie queries personalizadas para explorar os dados do seu restaurante
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Query JSON
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={JSON.stringify(exampleQuery, null, 2)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => setQuery(JSON.stringify(exampleQuery, null, 2))}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Carregar exemplo
          </button>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {loading ? 'Executando...' : 'Executar Query'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Resultados ({results.length} registros)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(results[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.slice(0, 100).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > 100 && (
            <div className="mt-4 text-sm text-gray-600">
              Mostrando apenas os primeiros 100 registros de {results.length} encontrados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

