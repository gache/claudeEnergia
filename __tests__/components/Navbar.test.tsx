import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/Navbar'

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

describe('Navbar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/')
    mockSetTarifa.mockClear()
    mockGetTarifa.mockReturnValue({ hc: 0.19008, hp: 0.27436 })
  })

  it('renders all 4 nav links', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /historial/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comparativa/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registrar/i })).toBeInTheDocument()
  })

  it('marks Dashboard link as active (aria-current) when pathname is "/"', () => {
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /historial/i })).not.toHaveAttribute('aria-current')
  })

  it('marks Historial link as active when pathname is "/historial"', () => {
    mockPathname.mockReturnValue('/historial')
    render(<Navbar />)
    expect(screen.getByRole('link', { name: /historial/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current')
  })

  it('renders skip-to-content accessibility link', () => {
    render(<Navbar />)
    expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument()
  })

  it('opens tarifas panel showing HC and HP values', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /tarifas/i }))
    expect(screen.getByText(/0\.19008/)).toBeInTheDocument()
    expect(screen.getByText(/0\.27436/)).toBeInTheDocument()
  })

  it('pencil button opens HC and HP number inputs', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /tarifas/i }))
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    expect(screen.getByText('HC €/kWh')).toBeInTheDocument()
    expect(screen.getByText('HP €/kWh')).toBeInTheDocument()
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2)
  })

  it('cancel button closes edit form', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /tarifas/i }))
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
  })

  it('save button calls setTarifa with entered values', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /tarifas/i }))
    fireEvent.click(screen.getByTitle(/editar tarifa/i))
    const [hcInput, hpInput] = screen.getAllByRole('spinbutton')
    fireEvent.change(hcInput, { target: { value: '0.20' } })
    fireEvent.change(hpInput, { target: { value: '0.30' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(mockSetTarifa).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Number), 0.20, 0.30
    )
  })
})
