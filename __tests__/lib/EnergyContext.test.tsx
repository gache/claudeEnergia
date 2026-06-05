import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { EnergyProvider, useEnergy } from '@/lib/EnergyContext'
import { getDoc, setDoc } from 'firebase/firestore'

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

  it('removeRegistro removes record matching mes+año', async () => {
    const stored = [
      { mes: 1, año: 2026, hc: 100, hp: 200 },
      { mes: 2, año: 2026, hc: 50, hp: 80 },
    ]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { result.current.removeRegistro(1, 2026) })
    expect(result.current.registros.find(r => r.mes === 1 && r.año === 2026)).toBeUndefined()
    expect(result.current.registros).toHaveLength(1)
    expect(result.current.registros[0].mes).toBe(2)
  })

  it('removeRegistro no-ops when record does not exist', async () => {
    const stored = [{ mes: 3, año: 2026, hc: 100, hp: 200 }]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { result.current.removeRegistro(99, 2026) })
    expect(result.current.registros).toHaveLength(1)
  })

  it('setTarifa adds a new tarifa', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { result.current.setTarifa(2026, 1, 0.18, 0.26) })
    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.18, hp: 0.26 })
  })

  it('setTarifa overwrites existing tarifa with same año+mes', async () => {
    const stored = [{ año: 2026, mes: 1, hc: 0.18, hp: 0.26 }]
    localStorage.setItem('energia-tarifas-v2', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { result.current.setTarifa(2026, 1, 0.20, 0.30) })
    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.20, hp: 0.30 })
    expect(result.current.tarifas.filter(t => t.año === 2026 && t.mes === 1)).toHaveLength(1)
  })

  it('getByYear returns KPIs for requested year only, sorted by mes', async () => {
    const stored = [
      { mes: 3, año: 2026, hc: 100, hp: 200 },
      { mes: 1, año: 2026, hc: 50,  hp: 80  },
      { mes: 6, año: 2025, hc: 200, hp: 300 }, // different year — excluded
    ]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    const kpis = result.current.getByYear(2026)
    expect(kpis).toHaveLength(2)
    expect(kpis[0].mes).toBe(1)   // sorted ascending
    expect(kpis[1].mes).toBe(3)
    expect(kpis[0].total).toBe(130)  // 50+80
    expect(kpis[1].total).toBe(300)  // 100+200
  })

  it('getByYear returns empty array when no records for year', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(result.current.getByYear(2099)).toEqual([])
  })

  it('starts with syncStatus "loading"', () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    expect(result.current.syncStatus).toBe('loading')
  })

  it('sets syncStatus to "ok" after successful Firestore init', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { await Promise.resolve() })
    expect(result.current.syncStatus).toBe('ok')
  })

  it('handles corrupt localStorage registros gracefully', async () => {
    localStorage.setItem('energia-registros-v1', 'not-valid-json{{{')
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    // Must survive corrupt data — registros stays a valid array
    expect(Array.isArray(result.current.registros)).toBe(true)
    // Parse error clears the key; localStorage save effect then writes [] back
    const stored = localStorage.getItem('energia-registros-v1')
    expect(stored).not.toBe('not-valid-json{{{')
  })

  it('handles corrupt localStorage tarifas gracefully', async () => {
    localStorage.setItem('energia-tarifas-v2', '[[[[invalid')
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    expect(Array.isArray(result.current.tarifas)).toBe(true)
    const stored = localStorage.getItem('energia-tarifas-v2')
    expect(stored).not.toBe('[[[[invalid')
  })

  it('loads registros and tarifas from Firestore when document exists', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        registros: [{ mes: 5, año: 2026, hc: 50, hp: 80 }],
        tarifas: [{ año: 2026, mes: 1, hc: 0.18, hp: 0.26 }],
      }),
    } as ReturnType<typeof getDoc> extends Promise<infer R> ? R : never)
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { await Promise.resolve() })
    expect(result.current.registros).toContainEqual(
      expect.objectContaining({ mes: 5, hc: 50, hp: 80 })
    )
    expect(result.current.syncStatus).toBe('ok')
  })

  it('sets syncStatus to "error" when Firestore init throws', async () => {
    vi.mocked(getDoc).mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { await Promise.resolve() })
    expect(result.current.syncStatus).toBe('error')
  })

  it('persists registros to localStorage immediately on state change', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => {
      result.current.addOrUpdate({ mes: 7, año: 2026, hc: 75, hp: 125 })
    })
    const stored = JSON.parse(localStorage.getItem('energia-registros-v1') || '[]')
    expect(stored).toContainEqual(expect.objectContaining({ mes: 7, hc: 75, hp: 125 }))
  })

  it('triggers Firestore save after 60s debounce', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ registros: [], tarifas: [] }),
    } as ReturnType<typeof getDoc> extends Promise<infer R> ? R : never)
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { await Promise.resolve() })
    vi.mocked(setDoc).mockClear()

    await act(async () => {
      result.current.addOrUpdate({ mes: 8, año: 2026, hc: 60, hp: 90 })
    })
    expect(vi.mocked(setDoc)).not.toHaveBeenCalled()

    await act(async () => { await vi.runAllTimersAsync() })
    expect(vi.mocked(setDoc)).toHaveBeenCalled()
  })

  it('sets syncStatus to "error" when debounce Firestore save fails', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ registros: [], tarifas: [] }),
    } as ReturnType<typeof getDoc> extends Promise<infer R> ? R : never)
    vi.mocked(setDoc).mockRejectedValueOnce(new Error('Save failed'))

    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    await act(async () => { await Promise.resolve() })

    await act(async () => {
      result.current.addOrUpdate({ mes: 9, año: 2026, hc: 40, hp: 60 })
    })
    await act(async () => { await vi.runAllTimersAsync() })

    expect(result.current.syncStatus).toBe('error')
  })

  it('getTarifa returns hardcoded defaults when no candidates match', async () => {
    // Request tarifa for year before all stored tarifas → no candidates
    const tarifas = [{ año: 2025, mes: 1, hc: 0.15, hp: 0.25 }]
    localStorage.setItem('energia-tarifas-v2', JSON.stringify(tarifas))
    const { result } = renderHook(() => useEnergy(), { wrapper })
    await act(async () => { await Promise.resolve() })
    // Year 2000 is before 2025 → filter yields nothing → returns hardcoded defaults
    expect(result.current.getTarifa(2000, 1)).toEqual({ hc: 0.19008, hp: 0.27436 })
  })
})
