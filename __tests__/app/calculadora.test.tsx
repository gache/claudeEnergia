import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcularKPI } from '@/lib/data'
import CalculadoraPage from '@/app/calculadora/page'

const { mockKpiFor, mockGetTarifa } = vi.hoisted(() => ({
  mockKpiFor: vi.fn(() => null),
  mockGetTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
}))

vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    kpiFor: mockKpiFor,
    getTarifa: mockGetTarifa,
    registros: [], tarifas: [], syncStatus: 'ok' as const,
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    setTarifa: vi.fn(), getByYear: vi.fn(() => []),
  }),
}))

describe('CalculadoraPage', () => {
  beforeEach(() => {
    mockKpiFor.mockReturnValue(null)
    mockGetTarifa.mockReturnValue({ hc: 0.19008, hp: 0.27436 })
  })

  it('renders heading "Calculadora de consumo"', () => {
    render(<CalculadoraPage />)
    expect(screen.getByRole('heading', { name: /calculadora de consumo/i })).toBeInTheDocument()
  })

  it('shows empty-state message before values entered', () => {
    render(<CalculadoraPage />)
    expect(screen.getByText(/introduce valores de consumo/i)).toBeInTheDocument()
  })

  it('shows "Coste actual" section after HC value entered', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    expect(screen.getByText(/coste actual/i)).toBeInTheDocument()
  })

  it('shows load button when existing data available', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<CalculadoraPage />)
    expect(screen.getByRole('button', { name: /cargar datos de/i })).toBeInTheDocument()
  })

  it('loads existing HC/HP when load button clicked', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<CalculadoraPage />)
    fireEvent.click(screen.getByRole('button', { name: /cargar datos de/i }))
    // After loading, Coste actual section should appear
    expect(screen.getByText(/coste actual/i)).toBeInTheDocument()
  })

  it('shows load shift simulator when HP > 0', () => {
    render(<CalculadoraPage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '100' } })
    fireEvent.change(inputs[1], { target: { value: '200' } })
    expect(screen.getByText(/desplazamiento de carga/i)).toBeInTheDocument()
  })

  it('does not show load shift simulator when HP = 0', () => {
    render(<CalculadoraPage />)
    const inputs = screen.getAllByRole('spinbutton')
    fireEvent.change(inputs[0], { target: { value: '100' } })
    expect(screen.queryByText(/desplazamiento de carga/i)).not.toBeInTheDocument()
  })

  it('shows tariff simulator section when values entered', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    expect(screen.getByText(/simulador de tarifas alternativas/i)).toBeInTheDocument()
  })

  it('shows inline HC cost preview when HC value entered', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    // 100 * 0.19008 = 19.008
    expect(screen.getByText(/→ 19\.008 €/)).toBeInTheDocument()
  })

  it('shows inline HP cost preview when HP value entered', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '200' } })
    // 200 * 0.27436 = 54.872
    expect(screen.getByText(/→ 54\.872 €/)).toBeInTheDocument()
  })

  it('shows "Sin ahorro" when shift slider is at 0 with HP > 0', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '200' } })
    // shift defaults to 0 → ahorro = 0
    expect(screen.getByText(/sin ahorro/i)).toBeInTheDocument()
  })

  it('shows "Ahorro estimado" when shift slider > 0', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '200' } })
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(screen.getByText(/ahorro estimado/i)).toBeInTheDocument()
  })

  it('shows annual savings estimate in shift section when ahorro > 0', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '200' } })
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(screen.getAllByText(/anual estimado/i).length).toBeGreaterThan(0)
  })

  it('tariff simulator shows "Sin diferencia" when simulated tariffs equal current', () => {
    render(<CalculadoraPage />)
    // Enter HC only (HP=0 so shift section hidden, no conflict)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    // Default simHCRate and simHPRate match current tariff → difTarifa = 0
    expect(screen.getByText(/sin diferencia/i)).toBeInTheDocument()
  })

  it('tariff simulator shows "Ahorro con tarifa simulada" when sim tariff is lower', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    // inputs: [HC, HP, simHC, simHP] — set simHC lower than 0.19008
    fireEvent.change(screen.getAllByRole('spinbutton')[2], { target: { value: '0.10' } })
    expect(screen.getByText(/ahorro con tarifa simulada/i)).toBeInTheDocument()
  })

  it('tariff simulator shows "Coste adicional" when sim tariff is higher', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    // Set simHC higher than 0.19008
    fireEvent.change(screen.getAllByRole('spinbutton')[2], { target: { value: '0.50' } })
    expect(screen.getByText(/coste adicional/i)).toBeInTheDocument()
  })

  it('tariff simulator shows annual estimate when tariffs differ', () => {
    render(<CalculadoraPage />)
    fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('spinbutton')[2], { target: { value: '0.10' } })
    expect(screen.getAllByText(/anual estimado/i).length).toBeGreaterThan(0)
  })

  it('loads data from empty-state card load button', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 0 })
    mockKpiFor.mockReturnValue(existing)
    render(<CalculadoraPage />)
    // Empty state has simpler load button "Cargar Ene 2026"
    const loadBtns = screen.getAllByRole('button', { name: /cargar/i })
    // Click the one without "datos de" (the empty-state one)
    const emptyStateBtn = loadBtns.find(b => !/datos de/i.test(b.textContent || ''))
    expect(emptyStateBtn).toBeDefined()
    fireEvent.click(emptyStateBtn!)
    expect(screen.getByText(/coste actual/i)).toBeInTheDocument()
  })
})
