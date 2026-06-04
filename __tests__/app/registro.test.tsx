import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcularKPI } from '@/lib/data'
import RegistroPage from '@/app/registro/page'

const { mockAddOrUpdate, mockRemoveRegistro, mockKpiFor, mockGetTarifa } = vi.hoisted(() => ({
  mockAddOrUpdate: vi.fn(),
  mockRemoveRegistro: vi.fn(),
  mockKpiFor: vi.fn(() => null),
  mockGetTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
}))

vi.mock('@/components/KPISkeleton', () => ({ default: () => <div /> }))
vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    addOrUpdate: mockAddOrUpdate,
    removeRegistro: mockRemoveRegistro,
    kpiFor: mockKpiFor,
    getTarifa: mockGetTarifa,
    registros: [], tarifas: [], syncStatus: 'ok' as const,
    setTarifa: vi.fn(), getByYear: vi.fn(() => []),
  }),
}))

describe('RegistroPage', () => {
  beforeEach(() => {
    mockAddOrUpdate.mockClear()
    mockRemoveRegistro.mockClear()
    mockKpiFor.mockReturnValue(null)
    mockGetTarifa.mockReturnValue({ hc: 0.19008, hp: 0.27436 })
  })

  it('renders heading "Registrar consumo"', () => {
    render(<RegistroPage />)
    expect(screen.getByRole('heading', { name: /registrar consumo/i })).toBeInTheDocument()
  })

  it('renders HC and HP labeled inputs', () => {
    render(<RegistroPage />)
    expect(screen.getByLabelText(/HC — Heures Creuses/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/HP — Heures Pleines/i)).toBeInTheDocument()
  })

  it('save button is disabled when no values entered', () => {
    render(<RegistroPage />)
    expect(screen.getByRole('button', { name: /guardar registro/i })).toBeDisabled()
  })

  it('save button enabled after entering HC and HP values', () => {
    render(<RegistroPage />)
    fireEvent.change(screen.getByLabelText(/HC — Heures Creuses/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/HP — Heures Pleines/i), { target: { value: '200' } })
    expect(screen.getByRole('button', { name: /guardar registro/i })).not.toBeDisabled()
  })

  it('calls addOrUpdate with mes/año/hc/hp when save clicked', () => {
    render(<RegistroPage />)
    fireEvent.change(screen.getByLabelText(/HC — Heures Creuses/i), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText(/HP — Heures Pleines/i), { target: { value: '200' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar registro/i }))
    expect(mockAddOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ hc: 100, hp: 200 })
    )
  })

  it('shows live KPI preview when HC value entered', () => {
    render(<RegistroPage />)
    fireEvent.change(screen.getByLabelText(/HC — Heures Creuses/i), { target: { value: '100' } })
    expect(screen.getByText(/vista previa/i)).toBeInTheDocument()
  })

  it('shows "Registro existente" badge when kpiFor returns data', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<RegistroPage />)
    expect(screen.getAllByText(/registro existente/i).length).toBeGreaterThan(0)
  })

  it('shows "Cargar valores" button when existing record present', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<RegistroPage />)
    expect(screen.getByRole('button', { name: /cargar valores/i })).toBeInTheDocument()
  })

  it('loads existing HC/HP into inputs when "Cargar valores" clicked', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<RegistroPage />)
    fireEvent.click(screen.getByRole('button', { name: /cargar valores/i }))
    expect(screen.getByLabelText(/HC — Heures Creuses/i)).toHaveValue(80)
    expect(screen.getByLabelText(/HP — Heures Pleines/i)).toHaveValue(120)
  })

  it('shows delete button when existing record present', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<RegistroPage />)
    expect(screen.getByRole('button', { name: /eliminar registro/i })).toBeInTheDocument()
  })

  it('first delete click asks for confirmation, second calls removeRegistro', () => {
    const existing = calcularKPI({ mes: 1, año: 2026, hc: 80, hp: 120 })
    mockKpiFor.mockReturnValue(existing)
    render(<RegistroPage />)
    fireEvent.click(screen.getByRole('button', { name: /eliminar registro/i }))
    expect(screen.getByRole('button', { name: /confirmar eliminación/i })).toBeInTheDocument()
    expect(mockRemoveRegistro).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /confirmar eliminación/i }))
    expect(mockRemoveRegistro).toHaveBeenCalled()
  })
})
