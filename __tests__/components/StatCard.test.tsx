import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '@/components/StatCard'
import { Zap } from 'lucide-react'

describe('StatCard', () => {
  it('renders titulo and valor', () => {
    render(<StatCard titulo="Consumo Total" valor="300" icono={Zap} />)
    expect(screen.getByText('Consumo Total')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('renders unidad when provided', () => {
    render(<StatCard titulo="Consumo" valor="300" unidad="kWh" icono={Zap} />)
    expect(screen.getByText('kWh')).toBeInTheDocument()
  })

  it('does not render unidad when omitted', () => {
    render(<StatCard titulo="Consumo" valor="300" icono={Zap} />)
    expect(screen.queryByText('kWh')).not.toBeInTheDocument()
  })

  it('renders subLabel when provided', () => {
    render(<StatCard titulo="Costo" valor="50.00" icono={Zap} subLabel="enero 2026" />)
    expect(screen.getByText('enero 2026')).toBeInTheDocument()
  })

  it('shows savings color class for negative variacion (mejora)', () => {
    const { container } = render(
      <StatCard titulo="Costo" valor="50" icono={Zap} variacion={-10} />
    )
    const trendRow = container.querySelector('.text-savings-600')
    expect(trendRow).toBeInTheDocument()
    expect(screen.getByText('10% vs mes anterior')).toBeInTheDocument()
  })

  it('shows red color class for positive variacion (empeora)', () => {
    const { container } = render(
      <StatCard titulo="Costo" valor="50" icono={Zap} variacion={10} />
    )
    const trendRow = container.querySelector('.text-red-500')
    expect(trendRow).toBeInTheDocument()
    expect(screen.getByText('10% vs mes anterior')).toBeInTheDocument()
  })

  it('does not render variacion section when variacion is undefined', () => {
    render(<StatCard titulo="Costo" valor="50" icono={Zap} />)
    expect(screen.queryByText(/vs mes anterior/)).not.toBeInTheDocument()
  })
})
