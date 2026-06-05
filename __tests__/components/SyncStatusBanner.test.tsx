import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SyncStatusBanner from '@/components/SyncStatusBanner'

const { mockSyncStatus } = vi.hoisted(() => ({
  mockSyncStatus: { value: 'ok' as 'ok' | 'error' | 'loading' },
}))

vi.mock('@/lib/EnergyContext', () => ({
  useEnergy: () => ({
    syncStatus: mockSyncStatus.value,
    registros: [], tarifas: [],
    addOrUpdate: vi.fn(), removeRegistro: vi.fn(),
    setTarifa: vi.fn(), getTarifa: vi.fn(() => ({ hc: 0.19008, hp: 0.27436 })),
    kpiFor: vi.fn(() => null), getByYear: vi.fn(() => []),
  }),
}))

describe('SyncStatusBanner', () => {
  it('renders nothing when syncStatus is "ok"', () => {
    mockSyncStatus.value = 'ok'
    const { container } = render(<SyncStatusBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when syncStatus is "loading"', () => {
    mockSyncStatus.value = 'loading'
    const { container } = render(<SyncStatusBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders error banner when syncStatus is "error"', () => {
    mockSyncStatus.value = 'error'
    render(<SyncStatusBanner />)
    expect(screen.getByText(/sin conexión a la nube/i)).toBeInTheDocument()
  })

  it('error banner mentions local save', () => {
    mockSyncStatus.value = 'error'
    render(<SyncStatusBanner />)
    expect(screen.getByText(/localmente/i)).toBeInTheDocument()
  })
})
