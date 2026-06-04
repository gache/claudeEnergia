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
})
