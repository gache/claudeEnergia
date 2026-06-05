import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChartSkeleton from '@/components/ChartSkeleton'
import KPISkeleton from '@/components/KPISkeleton'
import TableSkeleton from '@/components/TableSkeleton'

describe('ChartSkeleton', () => {
  it('renders without error', () => {
    const { container } = render(<ChartSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders 5 bar placeholders', () => {
    const { container } = render(<ChartSkeleton />)
    // 5 bar divs inside the flex container
    const bars = container.querySelectorAll('.flex-1.bg-gradient-to-t')
    expect(bars).toHaveLength(5)
  })
})

describe('KPISkeleton', () => {
  it('renders 4 cards by default', () => {
    const { container } = render(<KPISkeleton />)
    const cards = container.querySelectorAll('.bg-white.rounded-2xl')
    expect(cards).toHaveLength(4)
  })

  it('renders custom count of cards', () => {
    const { container } = render(<KPISkeleton count={6} />)
    const cards = container.querySelectorAll('.bg-white.rounded-2xl')
    expect(cards).toHaveLength(6)
  })

  it('renders 1 card when count=1', () => {
    const { container } = render(<KPISkeleton count={1} />)
    const cards = container.querySelectorAll('.bg-white.rounded-2xl')
    expect(cards).toHaveLength(1)
  })
})

describe('TableSkeleton', () => {
  it('renders a table element', () => {
    render(<TableSkeleton />)
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders 5 body rows by default', () => {
    const { container } = render(<TableSkeleton />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(5)
  })

  it('renders custom number of body rows', () => {
    const { container } = render(<TableSkeleton rows={3} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
  })
})
