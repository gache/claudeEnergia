import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VarBadge from '@/components/VarBadge'

describe('VarBadge', () => {
  it('renders dash for null pct', () => {
    render(<VarBadge pct={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders red badge for positive pct (cost increased)', () => {
    const { container } = render(<VarBadge pct={5.5} />)
    expect(container.querySelector('.text-red-600')).toBeInTheDocument()
    expect(screen.getByText(/5\.5%/)).toBeInTheDocument()
  })

  it('renders savings (green) badge for negative pct (cost decreased)', () => {
    const { container } = render(<VarBadge pct={-3.2} />)
    expect(container.querySelector('.text-savings-700')).toBeInTheDocument()
    expect(screen.getByText(/3\.2%/)).toBeInTheDocument()
  })

  it('shows absolute value — negative pct renders as positive number', () => {
    render(<VarBadge pct={-10.0} />)
    expect(screen.getByText(/10\.0%/)).toBeInTheDocument()
    expect(screen.queryByText(/-10/)).not.toBeInTheDocument()
  })

  it('renders up arrow for positive pct', () => {
    render(<VarBadge pct={1} />)
    expect(screen.getByText('▲', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })

  it('renders down arrow for negative pct', () => {
    render(<VarBadge pct={-1} />)
    expect(screen.getByText('▼', { selector: '[aria-hidden="true"]' })).toBeInTheDocument()
  })
})
