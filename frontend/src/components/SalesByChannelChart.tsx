import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SalesByChannelChartProps {
  data: Array<{
    id: number;
    name: string;
    salesCount: number;
    totalRevenue: number;
    avgTicket: number;
  }>;
}

export default function SalesByChannelChart({ data }: SalesByChannelChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    revenue: Math.round(item.totalRevenue),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `R$ ${value.toLocaleString('pt-BR')}` : value,
            name === 'revenue' ? 'Faturamento' : 'Vendas',
          ]}
        />
        <Legend />
        <Bar dataKey="revenue" fill="#0ea5e9" name="Faturamento" />
        <Bar dataKey="salesCount" fill="#10b981" name="Vendas" />
      </BarChart>
    </ResponsiveContainer>
  );
}

