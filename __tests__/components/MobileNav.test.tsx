import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileNav from '@/components/MobileNav'

const { mockPathname } = vi.hoisted(() => ({
  mockPathname: vi.fn(() => '/'),
}))

vi.mock('next/navigation', () => ({ usePathname: mockPathname }))
vi.mock('next/link', () => ({
  default: ({ children, href, onClick, ...props }: { children: React.ReactNode; href: string; onClick?: () => void; [k: string]: unknown }) =>
    <a href={href} onClick={onClick} {...props}>{children}</a>,
}))

describe('MobileNav', () => {
  it('renders hamburger button initially', () => {
    render(<MobileNav />)
    expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument()
  })

  it('drawer is closed by default — no nav links visible', () => {
    render(<MobileNav />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens drawer when hamburger clicked', () => {
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    expect(screen.getByRole('dialog', { name: /menú de navegación/i })).toBeInTheDocument()
  })

  it('shows all 4 nav links when drawer open', () => {
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /historial/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /comparativa/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /registrar/i })).toBeInTheDocument()
  })

  it('hamburger toggles label to "Cerrar menú" when open', () => {
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    expect(screen.getByRole('button', { name: /cerrar menú/i })).toBeInTheDocument()
  })

  it('closes drawer when hamburger clicked again', () => {
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    fireEvent.click(screen.getByRole('button', { name: /cerrar menú/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('active link has brand-600 class when pathname matches', () => {
    mockPathname.mockReturnValue('/')
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    const dashLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashLink.className).toContain('bg-brand-600')
  })

  it('closes drawer when a nav link is clicked', () => {
    render(<MobileNav />)
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }))
    fireEvent.click(screen.getByRole('link', { name: /historial/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
