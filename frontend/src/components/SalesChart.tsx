import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface SalesChartProps {
  data: Array<{
    period: string;
    revenue: number;
    sales: number;
  }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    period: format(new Date(item.period), 'dd/MM'),
    revenue: Math.round(item.revenue),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `R$ ${value.toLocaleString('pt-BR')}` : value,
            name === 'revenue' ? 'Faturamento' : 'Vendas',
          ]}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          stroke="#0ea5e9"
          strokeWidth={2}
          name="Faturamento"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="sales"
          stroke="#10b981"
          strokeWidth={2}
          name="Vendas"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

