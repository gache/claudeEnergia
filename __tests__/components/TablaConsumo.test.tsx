import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TablaConsumo from '@/components/TablaConsumo'
import { calcularKPI } from '@/lib/data'

const makeKPI = (mes: number) =>
  calcularKPI({ mes, año: 2026, hc: 100, hp: 200 })

describe('TablaConsumo', () => {
  it('renders "0 meses" badge for empty data', () => {
    render(<TablaConsumo data={[]} />)
    expect(screen.getByText('0 meses')).toBeInTheDocument()
  })

  it('renders "1 mes" for single-row data (singular)', () => {
    render(<TablaConsumo data={[makeKPI(1)]} />)
    expect(screen.getByText('1 mes')).toBeInTheDocument()
  })

  it('renders "3 meses" for three-row data', () => {
    render(<TablaConsumo data={[makeKPI(1), makeKPI(2), makeKPI(3)]} />)
    expect(screen.getByText('3 meses')).toBeInTheDocument()
  })

  it('renders accessible table with aria-label', () => {
    render(<TablaConsumo data={[makeKPI(1)]} />)
    expect(
      screen.getByRole('table', { name: /detalle mensual/i })
    ).toBeInTheDocument()
  })
})
