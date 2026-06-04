import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcularKPI } from '@/lib/data'
import DashboardPage from '@/app/page'

const { mockKpiFor, mockGetByYear } = vi.hoisted(() => ({
  mockKpiFor: vi.fn(() => null),
  mockGetByYear: vi.fn(() => []),
}))

vi.mock('next/dynamic', () => ({
  default: () => () => <div data-testid="chart" />,
}))
vi.mock('@/components/ConsumoHCHPChart', () => ({ default: () => <div data-testid="consumo-chart" /> }))
vi.mock('@/components/CostoEvolucionChart', () => ({ default: () => <div data-testid="costo-chart" /> }))
vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    kpiFor: mockKpiFor,
    getByYear: mockGetByYear,
    registros: [], tarifas: [], syncStatus: 'ok' as const,
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    getTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
    setTarifa: vi.fn(),
  }),
}))

const kpiJan = calcularKPI({ mes: 1, año: 2026, hc: 150, hp: 250 })  // total=400, hc 37.5%, hp 62.5%

describe('DashboardPage', () => {
  beforeEach(() => {
    mockKpiFor.mockReturnValue(null)
    mockGetByYear.mockReturnValue([])
  })

  describe('empty state', () => {
    it('renders "Sin datos" message when no records exist', () => {
      render(<DashboardPage />)
      expect(screen.getByText(/sin datos/i)).toBeInTheDocument()
    })

    it('renders link to /registro in empty state', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('link', { name: /registrar consumo/i })).toHaveAttribute('href', '/registro')
    })
  })

  describe('with data', () => {
    beforeEach(() => {
      mockKpiFor.mockReturnValue(kpiJan)
      mockGetByYear.mockReturnValue([kpiJan])
    })

    it('renders "Dashboard Energético" heading', () => {
      render(<DashboardPage />)
      expect(screen.getByRole('heading', { name: /dashboard energético/i })).toBeInTheDocument()
    })

    it('renders Consumo HC card with correct value', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Consumo HC')).toBeInTheDocument()
      expect(screen.getAllByText('150.000').length).toBeGreaterThan(0)
    })

    it('renders Consumo HP card with correct value', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Consumo HP')).toBeInTheDocument()
      expect(screen.getAllByText('250.000').length).toBeGreaterThan(0)
    })

    it('renders Consumo Total card with correct value', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Consumo Total')).toBeInTheDocument()
      expect(screen.getAllByText('400.000').length).toBeGreaterThan(0)
    })

    it('renders Costo Total card', () => {
      render(<DashboardPage />)
      expect(screen.getByText('Costo Total')).toBeInTheDocument()
    })

    it('shows HC and HP tariff badges in header', () => {
      render(<DashboardPage />)
      expect(screen.getByText(/HC.*€\/kWh/)).toBeInTheDocument()
      expect(screen.getByText(/HP.*€\/kWh/)).toBeInTheDocument()
    })

    it('renders HC and HP participation percentages', () => {
      render(<DashboardPage />)
      expect(screen.getByText(/Participación del consumo/i)).toBeInTheDocument()
      expect(screen.getByText('37.5%')).toBeInTheDocument()
      expect(screen.getByText('62.5%')).toBeInTheDocument()
    })
  })

  describe('comparison table', () => {
    it('renders last-3-months table when data available', () => {
      const kpis = [
        calcularKPI({ mes: 1, año: 2026, hc: 100, hp: 200 }),
        calcularKPI({ mes: 2, año: 2026, hc: 110, hp: 210 }),
        calcularKPI({ mes: 3, año: 2026, hc: 120, hp: 220 }),
      ]
      mockKpiFor.mockReturnValue(kpis[2])
      mockGetByYear.mockReturnValue(kpis)
      render(<DashboardPage />)
      expect(screen.getByRole('table', { name: /comparativa últimos 3 meses/i })).toBeInTheDocument()
    })

    it('does not render comparison table when no data', () => {
      render(<DashboardPage />)
      expect(screen.queryByRole('table', { name: /comparativa/i })).not.toBeInTheDocument()
    })
  })
})
