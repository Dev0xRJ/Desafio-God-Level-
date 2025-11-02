import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import DateRangePicker from '../components/DateRangePicker'

describe('DateRangePicker', () => {
  it('renderiza inputs de data', () => {
    const mockStart = vi.fn()
    const mockEnd = vi.fn()

    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={mockStart}
        onEndDateChange={mockEnd}
      />
    )

    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument()
  })

  it('chama callback quando data inicial muda', async () => {
    const user = userEvent.setup()
    const mockStart = vi.fn()
    const mockEnd = vi.fn()

    render(
      <DateRangePicker
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartDateChange={mockStart}
        onEndDateChange={mockEnd}
      />
    )

    const startInput = screen.getByDisplayValue('2024-01-01')
    await user.clear(startInput)
    await user.type(startInput, '2024-02-01')

    expect(mockStart).toHaveBeenCalledWith('2024-02-01')
  })
})