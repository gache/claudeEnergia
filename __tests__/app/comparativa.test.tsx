import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcularKPI } from '@/lib/data'
import ComparativaPage from '@/app/comparativa/page'

const { mockGetByYear, mockRegistros } = vi.hoisted(() => ({
  mockGetByYear: vi.fn(() => []),
  mockRegistros: { value: [] as { mes: number; año: number; hc: number; hp: number }[] },
}))

vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="chart" /> }))
vi.mock('@/components/ComparativaChart', () => ({ default: () => <div data-testid="comparativa-chart" /> }))
vi.mock('@/components/ChartSkeleton', () => ({ default: () => <div /> }))
vi.mock('@/components/TableSkeleton', () => ({ default: () => <div /> }))
vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    getByYear: mockGetByYear,
    get registros() { return mockRegistros.value },
    tarifas: [], syncStatus: 'ok' as const,
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    setTarifa: vi.fn(), getTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
    kpiFor: vi.fn(() => null),
  }),
}))

const kpi2025 = [
  calcularKPI({ mes: 1, año: 2025, hc: 80,  hp: 150 }),
  calcularKPI({ mes: 2, año: 2025, hc: 90,  hp: 160 }),
]
const kpi2026 = [
  calcularKPI({ mes: 1, año: 2026, hc: 100, hp: 200 }),
  calcularKPI({ mes: 2, año: 2026, hc: 110, hp: 190 }),
]

describe('ComparativaPage', () => {
  beforeEach(() => {
    mockGetByYear.mockReturnValue([])
    mockRegistros.value = []
  })

  it('renders heading "Comparativa interanual"', () => {
    render(<ComparativaPage />)
    expect(screen.getByRole('heading', { name: /comparativa interanual/i })).toBeInTheDocument()
  })

  it('renders Base and Comp. year selector labels', () => {
    render(<ComparativaPage />)
    expect(screen.getByText('Base')).toBeInTheDocument()
    expect(screen.getByText('Comp.')).toBeInTheDocument()
  })

  describe('with data for two years', () => {
    beforeEach(() => {
      mockRegistros.value = [
        ...kpi2025.map(k => ({ mes: k.mes, año: 2025, hc: k.hc, hp: k.hp })),
        ...kpi2026.map(k => ({ mes: k.mes, año: 2026, hc: k.hc, hp: k.hp })),
      ]
      mockGetByYear.mockImplementation((y: number) =>
        y === 2025 ? kpi2025 : y === 2026 ? kpi2026 : []
      )
    })

    it('renders comparison table with month rows', () => {
      render(<ComparativaPage />)
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('shows summary KPI labels', () => {
      render(<ComparativaPage />)
      expect(screen.getByText('Variación media consumo')).toBeInTheDocument()
      expect(screen.getByText('Variación media coste')).toBeInTheDocument()
    })
  })

  it('shows "Sin datos suficientes" when no paired data', () => {
    render(<ComparativaPage />)
    expect(screen.getByText(/sin datos suficientes/i)).toBeInTheDocument()
  })
})
