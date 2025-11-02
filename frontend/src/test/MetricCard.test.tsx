import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MetricCard from '../components/MetricCard'
import { TrendingUp } from 'lucide-react'

describe('MetricCard', () => {
  it('renderiza título e valor corretamente', () => {
    render(
      <MetricCard
        title="Faturamento Total"
        value="R$ 125.420,50"
        icon={TrendingUp}
        trend="up"
        trendValue="12%"
      />
    )

    expect(screen.getByText('Faturamento Total')).toBeInTheDocument()
    expect(screen.getByText('R$ 125.420,50')).toBeInTheDocument()
    expect(screen.getByText('12%')).toBeInTheDocument()
  })

  it('aplica classe CSS correta para trend positiva', () => {
    render(
      <MetricCard
        title="Vendas"
        value="1.250"
        icon={TrendingUp}
        trend="up"
        trendValue="5%"
      />
    )

    const trendElement = screen.getByText('5%')
    expect(trendElement).toHaveClass('text-green-600')
  })

  it('aplica classe CSS correta para trend negativa', () => {
    render(
      <MetricCard
        title="Vendas"
        value="1.250"
        icon={TrendingUp}
        trend="down"
        trendValue="3%"
      />
    )

    const trendElement = screen.getByText('3%')
    expect(trendElement).toHaveClass('text-red-600')
  })
})