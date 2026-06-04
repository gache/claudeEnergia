import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { EnergyProvider, useEnergy } from '@/lib/EnergyContext'

vi.mock('@/lib/firebase', () => ({
  getDb: () => ({}),
  getAuth_: () => ({ currentUser: null }),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
  serverTimestamp: vi.fn(() => null),
  collection: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (u: null) => void) => { cb(null); return () => {} }),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  getAuth: vi.fn(() => ({ currentUser: null })),
}))

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <EnergyProvider>{children}</EnergyProvider>
)

describe('EnergyContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('hydrates registros from localStorage on mount', async () => {
    const stored = [{ mes: 1, año: 2026, hc: 100, hp: 200 }]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(result.current.registros).toEqual(stored)
  })

  it('addOrUpdate adds new record', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => {
      result.current.addOrUpdate({ mes: 3, año: 2026, hc: 50, hp: 80 })
    })
    expect(result.current.registros.some(
      r => r.mes === 3 && r.año === 2026 && r.hc === 50 && r.hp === 80
    )).toBe(true)
  })

  it('addOrUpdate overwrites existing record with same mes+año', async () => {
    const initial = [{ mes: 1, año: 2026, hc: 100, hp: 200 }]
    localStorage.setItem('energia-registros-v1', JSON.stringify(initial))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => {
      result.current.addOrUpdate({ mes: 1, año: 2026, hc: 999, hp: 888 })
    })
    const r = result.current.registros.find(x => x.mes === 1 && x.año === 2026)
    expect(r?.hc).toBe(999)
    expect(r?.hp).toBe(888)
    expect(result.current.registros.filter(x => x.mes === 1 && x.año === 2026)).toHaveLength(1)
  })

  it('getTarifa returns hardcoded defaults when no tarifas stored', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.19008, hp: 0.27436 })
  })

  it('getTarifa returns most recent tarifa as fallback', async () => {
    const tarifas = [{ año: 2025, mes: 6, hc: 0.15, hp: 0.25 }]
    localStorage.setItem('energia-tarifas-v2', JSON.stringify(tarifas))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.15, hp: 0.25 })
  })

  it('kpiFor returns null when record not found', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(result.current.kpiFor(1, 2026)).toBeNull()
  })

  it('kpiFor returns calculated KPI for existing record', async () => {
    const stored = [{ mes: 1, año: 2026, hc: 100, hp: 200 }]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    const kpi = result.current.kpiFor(1, 2026)
    expect(kpi).not.toBeNull()
    expect(kpi?.total).toBe(300)
    expect(kpi?.ventajaHC).toBe(false)
  })
})
