import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedLayout from '@/components/ProtectedLayout'

const { mockLoading } = vi.hoisted(() => ({
  mockLoading: { value: false },
}))

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: mockLoading.value }),
}))

describe('ProtectedLayout', () => {
  it('renders children when not loading', () => {
    mockLoading.value = false
    render(<ProtectedLayout><p>contenido</p></ProtectedLayout>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })

  it('renders loading spinner when loading=true', () => {
    mockLoading.value = true
    render(<ProtectedLayout><p>contenido</p></ProtectedLayout>)
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
  })

  it('does not render children while loading', () => {
    mockLoading.value = true
    render(<ProtectedLayout><p data-testid="child">test</p></ProtectedLayout>)
    expect(screen.queryByTestId('child')).not.toBeInTheDocument()
  })
})
