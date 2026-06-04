import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcularKPI } from '@/lib/data'
import HistorialPage from '@/app/historial/page'

const { mockGetByYear, mockGetTarifa } = vi.hoisted(() => ({
  mockGetByYear: vi.fn(() => []),
  mockGetTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
}))

vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="chart" /> }))
vi.mock('@/components/TablaConsumo', () => ({ default: ({ data }: { data: unknown[] }) => <div data-testid="tabla">{data.length} rows</div> }))
vi.mock('@/components/ConsumoHCHPChart', () => ({ default: () => <div data-testid="consumo-chart" /> }))
vi.mock('@/components/CostoEvolucionChart', () => ({ default: () => <div data-testid="costo-chart" /> }))
vi.mock('@/components/ChartSkeleton', () => ({ default: () => <div /> }))
vi.mock('@/components/TableSkeleton', () => ({ default: () => <div /> }))
vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    getByYear: mockGetByYear,
    getTarifa: mockGetTarifa,
    registros: [], tarifas: [], syncStatus: 'ok' as const,
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    setTarifa: vi.fn(), kpiFor: vi.fn(() => null),
  }),
}))

const kpi1 = calcularKPI({ mes: 1, año: 2026, hc: 100, hp: 200 })
const kpi2 = calcularKPI({ mes: 2, año: 2026, hc: 110, hp: 180 })

describe('HistorialPage', () => {
  beforeEach(() => {
    mockGetByYear.mockReturnValue([])
    mockGetTarifa.mockReturnValue({ hc: 0.19008, hp: 0.27436 })
  })

  it('renders heading "Historial de consumo"', () => {
    render(<HistorialPage />)
    expect(screen.getByRole('heading', { name: /historial de consumo/i })).toBeInTheDocument()
  })

  it('shows "sin registros disponibles" when no data for year', () => {
    render(<HistorialPage />)
    expect(screen.getByText(/sin registros disponibles/i)).toBeInTheDocument()
  })

  it('shows "Sin datos" empty-state card when no data', () => {
    render(<HistorialPage />)
    expect(screen.getByText(/sin datos para/i)).toBeInTheDocument()
  })

  it('shows tariff strip with HC and HP values', () => {
    render(<HistorialPage />)
    expect(screen.getByText(/HC.*€\/kWh/)).toBeInTheDocument()
    expect(screen.getByText(/HP.*€\/kWh/)).toBeInTheDocument()
  })

  it('shows "0 meses" badge when no data', () => {
    render(<HistorialPage />)
    expect(screen.getByText('0 meses')).toBeInTheDocument()
  })

  describe('with data', () => {
    beforeEach(() => mockGetByYear.mockReturnValue([kpi1, kpi2]))

    it('shows month count badge', () => {
      render(<HistorialPage />)
      expect(screen.getByText('2 meses')).toBeInTheDocument()
    })

    it('renders Export CSV button', () => {
      render(<HistorialPage />)
      expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument()
    })

    it('shows year-end projection section when < 12 months', () => {
      render(<HistorialPage />)
      expect(screen.getByText(/proyección fin de año/i)).toBeInTheDocument()
    })

    it('shows HP dominance alert when >50% months have HP advantage', () => {
      // both kpi1 and kpi2 have hp > hc → ventajaHC=false → hpDomina=2/2 > 50%
      render(<HistorialPage />)
      expect(screen.getByText(/predomina tarifa hp/i)).toBeInTheDocument()
    })
  })

  it('year selector buttons render for available years', () => {
    render(<HistorialPage />)
    expect(screen.getByRole('button', { name: '2026' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument()
  })
})
