import { describe, it, expect } from 'vitest'
import {
  calcularKPI, calcularTotales, fmt, fmtNum,
  TARIFA_HC, TARIFA_HP,
} from '@/lib/data'

const base = { mes: 1, año: 2026, hc: 100, hp: 200 }

describe('calcularKPI', () => {
  it('computes total, costs, and percentages correctly', () => {
    const kpi = calcularKPI(base)
    expect(kpi.total).toBe(300)
    expect(kpi.costoHC).toBeCloseTo(100 * TARIFA_HC)
    expect(kpi.costoHP).toBeCloseTo(200 * TARIFA_HP)
    expect(kpi.costoTotal).toBeCloseTo(100 * TARIFA_HC + 200 * TARIFA_HP)
    expect(kpi.pctHC).toBeCloseTo((100 / 300) * 100)
    expect(kpi.pctHP).toBeCloseTo((200 / 300) * 100)
  })

  it('returns pctHC=0, pctHP=0, ventajaHC=false when hc=0 hp=0 (no Infinity)', () => {
    const kpi = calcularKPI({ ...base, hc: 0, hp: 0 })
    expect(kpi.pctHC).toBe(0)
    expect(kpi.pctHP).toBe(0)
    expect(kpi.ventajaHC).toBe(false)
    expect(kpi.costoTotal).toBe(0)
  })

  it('sets ventajaHC=true when hc >= hp', () => {
    const kpi = calcularKPI({ ...base, hc: 200, hp: 100 })
    expect(kpi.ventajaHC).toBe(true)
  })

  it('sets ventajaHC=true when hc === hp', () => {
    const kpi = calcularKPI({ ...base, hc: 150, hp: 150 })
    expect(kpi.ventajaHC).toBe(true)
  })

  it('sets ventajaHC=false when hp > hc', () => {
    const kpi = calcularKPI(base) // hc=100, hp=200
    expect(kpi.ventajaHC).toBe(false)
  })

  it('uses provided tarifa instead of defaults', () => {
    const kpi = calcularKPI(base, { hc: 0.10, hp: 0.20 })
    expect(kpi.costoHC).toBeCloseTo(100 * 0.10)
    expect(kpi.costoHP).toBeCloseTo(200 * 0.20)
    expect(kpi.tarifaHC).toBe(0.10)
    expect(kpi.tarifaHP).toBe(0.20)
  })

  it('preserves input fields in output', () => {
    const kpi = calcularKPI(base)
    expect(kpi.mes).toBe(1)
    expect(kpi.año).toBe(2026)
    expect(kpi.hc).toBe(100)
    expect(kpi.hp).toBe(200)
  })
})

describe('calcularTotales', () => {
  it('returns all zeros for empty array', () => {
    const totals = calcularTotales([])
    expect(totals.totalHC).toBe(0)
    expect(totals.totalHP).toBe(0)
    expect(totals.totalKwh).toBe(0)
    expect(totals.totalCosto).toBe(0)
    expect(totals.ventajaMeses).toBe(0)
  })

  it('sums fields correctly across multiple months', () => {
    const kpi1 = calcularKPI({ mes: 1, año: 2026, hc: 100, hp: 50 })  // ventajaHC=true
    const kpi2 = calcularKPI({ mes: 2, año: 2026, hc: 50, hp: 100 })  // ventajaHC=false
    const totals = calcularTotales([kpi1, kpi2])
    expect(totals.totalHC).toBe(150)
    expect(totals.totalHP).toBe(150)
    expect(totals.totalKwh).toBe(300)
    expect(totals.ventajaMeses).toBe(1)
  })
})

describe('fmt', () => {
  it('formats to 3 decimal places by default', () => {
    expect(fmt(1.23456)).toBe('1.235')
  })

  it('formats to specified decimal places', () => {
    expect(fmt(1.23456, 2)).toBe('1.23')
    expect(fmt(1.23456, 0)).toBe('1')
  })
})

describe('fmtNum', () => {
  it('rounds to 3 decimal places by default', () => {
    expect(fmtNum(1.23456)).toBe(1.235)
  })

  it('rounds to specified decimal places', () => {
    expect(fmtNum(1.23456, 2)).toBe(1.23)
  })
})
