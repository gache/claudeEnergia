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

  it('clicking a year button switches active year', () => {
    render(<HistorialPage />)
    const btn2025 = screen.getByRole('button', { name: '2025' })
    fireEvent.click(btn2025)
    expect(btn2025.className).toContain('bg-brand-600')
  })

  it('active year button does not have brand class for other years', () => {
    render(<HistorialPage />)
    const btn2025 = screen.getByRole('button', { name: '2025' })
    const btn2026 = screen.getByRole('button', { name: '2026' })
    // Before click: 2026 is active (current year in test env)
    fireEvent.click(btn2025)
    expect(btn2026.className).not.toContain('bg-brand-600')
  })

  it('clicking Export CSV button triggers file download', () => {
    mockGetByYear.mockReturnValue([kpi1, kpi2])
    render(<HistorialPage />)

    const mockClick = vi.fn()
    const mockAnchor = { href: '', download: '', click: mockClick }
    const origCreate = document.createElement.bind(document)
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement
      return origCreate(tag)
    })
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = vi.fn()

    fireEvent.click(screen.getByRole('button', { name: /exportar csv/i }))

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockClick).toHaveBeenCalled()
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    spy.mockRestore()
  })

  it('shows "1 mes" (singular) when exactly 1 month of data', () => {
    mockGetByYear.mockReturnValue([kpi1])
    render(<HistorialPage />)
    expect(screen.getByText('1 mes')).toBeInTheDocument()
  })

  it('projection badge shows "1 mes" singular when 1 month of data', () => {
    mockGetByYear.mockReturnValue([kpi1])
    render(<HistorialPage />)
    expect(screen.getByText(/basado en 1 mes\b/i)).toBeInTheDocument()
  })

  it('does not show projection when all 12 months present', () => {
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      calcularKPI({ mes: i + 1, año: 2026, hc: 100, hp: 200 })
    )
    mockGetByYear.mockReturnValue(allMonths)
    render(<HistorialPage />)
    expect(screen.queryByText(/proyección fin de año/i)).not.toBeInTheDocument()
  })

  it('shows HC advantage badge when ventajaMeses > 0', () => {
    const kpiHC = calcularKPI({ mes: 3, año: 2026, hc: 200, hp: 100 }) // hc >= hp → ventajaHC=true
    mockGetByYear.mockReturnValue([kpiHC])
    render(<HistorialPage />)
    expect(screen.getByText(/1m HC/)).toBeInTheDocument()
  })

  it('shows HP advantage badge when some months have HP advantage', () => {
    const kpiHC = calcularKPI({ mes: 3, año: 2026, hc: 200, hp: 100 }) // ventajaHC=true
    const kpiHP = calcularKPI({ mes: 4, año: 2026, hc: 100, hp: 200 }) // ventajaHC=false
    mockGetByYear.mockReturnValue([kpiHC, kpiHP])
    render(<HistorialPage />)
    expect(screen.getByText(/1m HP/)).toBeInTheDocument()
  })

  it('does not show HP alert when HP does not dominate majority of months', () => {
    const kpiHC = calcularKPI({ mes: 3, año: 2026, hc: 200, hp: 100 }) // ventajaHC=true
    const kpiHP = calcularKPI({ mes: 4, año: 2026, hc: 100, hp: 200 }) // ventajaHC=false
    // hpDominaCount=1, datos.length=2 → 1 is NOT > 2/2=1
    mockGetByYear.mockReturnValue([kpiHC, kpiHP])
    render(<HistorialPage />)
    expect(screen.queryByText(/predomina tarifa hp/i)).not.toBeInTheDocument()
  })

  it('shows ratio "—" when tarifa HC is 0', () => {
    mockGetTarifa.mockReturnValue({ hc: 0, hp: 0.27436 })
    render(<HistorialPage />)
    const ratioEl = screen.getByText(/ratio hp\/hc:/i)
    expect(ratioEl.textContent).toContain('—')
  })

  it('shows HC total and HP total in tariff strip when data present', () => {
    mockGetByYear.mockReturnValue([kpi1])
    render(<HistorialPage />)
    expect(screen.getByText(/HC total:/)).toBeInTheDocument()
    expect(screen.getByText(/HP total:/)).toBeInTheDocument()
  })
})
