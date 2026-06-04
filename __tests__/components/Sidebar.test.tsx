import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'

const { mockPathname, mockGetTarifa, mockSetTarifa } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => '/'),
  mockGetTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
  mockSetTarifa: vi.fn(),
}))

vi.mock('next/navigation', () => ({ usePathname: mockPathname }))
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [k: string]: unknown }) =>
    <a href={href} {...props}>{children}</a>,
}))
vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    getTarifa: mockGetTarifa,
    setTarifa: mockSetTarifa,
    registros: [], tarifas: [], syncStatus: 'ok' as const,
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    kpiFor: vi.fn(() => null), getByYear: vi.fn(() => []),
  }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/')
    mockSetTarifa.mockClear()
    mockGetTarifa.mockReturnValue({ hc: 0.19008, hp: 0.27436 })
  })

  it('renders brand name "claudeEnergía"', () => {
    render(<Sidebar />)
    expect(screen.getByText('claudeEnergía')).toBeInTheDocument()
  })

  it('renders all 4 nav links', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /historial/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comparativa/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registrar/i })).toBeInTheDocument()
  })

  it('active link has brand-600 background class when pathname matches', () => {
    render(<Sidebar />)
    const dashLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashLink.className).toContain('bg-brand-600')
  })

  it('inactive link does not have brand-600 background class', () => {
    mockPathname.mockReturnValue('/historial')
    render(<Sidebar />)
    const dashLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashLink.className).not.toContain('bg-brand-600')
  })

  it('shows current tariff HC and HP values in widget', () => {
    render(<Sidebar />)
    expect(screen.getByText(/0\.19008/)).toBeInTheDocument()
    expect(screen.getByText(/0\.27436/)).toBeInTheDocument()
  })

  it('pencil button opens HC and HP number inputs', () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    expect(screen.getByText('HC €/kWh')).toBeInTheDocument()
    expect(screen.getByText('HP €/kWh')).toBeInTheDocument()
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2)
  })

  it('cancel button closes edit form', () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
  })

  it('save button calls setTarifa with entered values', () => {
    render(<Sidebar />)
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    const [hcInput, hpInput] = screen.getAllByRole('spinbutton')
    fireEvent.change(hcInput, { target: { value: '0.21' } })
    fireEvent.change(hpInput, { target: { value: '0.31' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(mockSetTarifa).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number), 0.21, 0.31
    )
  })
})
