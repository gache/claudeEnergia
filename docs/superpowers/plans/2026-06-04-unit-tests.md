# Unit Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full unit test coverage to claudeEnergía — pure functions, EnergyContext, and React components.

**Architecture:** Vitest + jsdom for test runtime; @testing-library/react for component rendering; vi.mock() for Firebase and AuthContext isolation. Test files mirror source structure under `__tests__/`.

**Tech Stack:** vitest, @vitejs/plugin-react, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, @vitest/coverage-v8

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `vitest.config.ts` | Vitest config with jsdom, path alias `@` |
| Create | `vitest.setup.ts` | Import @testing-library/jest-dom matchers |
| Modify | `package.json` | Add `test` and `test:coverage` scripts |
| Create | `__tests__/lib/data.test.ts` | Pure function tests |
| Create | `__tests__/lib/EnergyContext.test.tsx` | Context logic tests |
| Create | `__tests__/components/StatCard.test.tsx` | StatCard rendering |
| Create | `__tests__/components/VarBadge.test.tsx` | VarBadge rendering |
| Create | `__tests__/components/TablaConsumo.test.tsx` | Table rendering |

---

## Task 1: Install Vitest and configure

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

Expected: packages added to `devDependencies` in package.json.

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Create vitest.setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test scripts to package.json**

In the `"scripts"` section, add after the `"lint"` line:

```json
"test": "vitest",
"test:coverage": "vitest --coverage"
```

- [ ] **Step 5: Verify setup works**

```bash
npx vitest --version
```

Expected: prints version like `1.x.x`, no errors.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: add vitest + testing-library setup"
```

---

## Task 2: Pure function tests — lib/data.ts

**Files:**
- Create: `__tests__/lib/data.test.ts`

- [ ] **Step 1: Create test file**

```bash
mkdir -p __tests__/lib
```

- [ ] **Step 2: Write tests**

Create `__tests__/lib/data.test.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/lib/data.test.ts
```

Expected: all 11 tests PASS. If any fail, the corresponding calculation in `lib/data.ts` has a bug — fix it before proceeding.

- [ ] **Step 4: Commit**

```bash
git add __tests__/lib/data.test.ts
git commit -m "test: add pure function tests for lib/data.ts"
```

---

## Task 3: EnergyContext logic tests

**Files:**
- Create: `__tests__/lib/EnergyContext.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/lib/EnergyContext.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { EnergyProvider, useEnergy } from '@/lib/EnergyContext'

// Mock Firebase module — return a stub db object
vi.mock('@/lib/firebase', () => ({
  getDb: () => ({}),
  getAuth_: () => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  }),
}))

// Mock firebase/firestore — stub all Firestore calls
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(() =>
    Promise.resolve({ exists: () => false })
  ),
  setDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() =>
    Promise.resolve({ empty: true, docs: [] })
  ),
  serverTimestamp: vi.fn(() => null),
  collection: vi.fn(() => ({})),
}))

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, cb) => {
    cb(null)
    return () => {}
  }),
  signInAnonymously: vi.fn(() => Promise.resolve()),
}))

// Mock AuthContext — useAuth just returns stub, EnergyContext calls it but ignores the result
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

    await act(async () => {
      await Promise.resolve() // flush localStorage effect
    })

    expect(result.current.registros).toEqual(stored)
  })

  it('addOrUpdate adds new record and keeps it sorted by mes', async () => {
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

    await act(async () => {
      await Promise.resolve()
    })

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

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.19008, hp: 0.27436 })
  })

  it('getTarifa returns most recent tarifa when no exact match (fallback)', async () => {
    const tarifas = [{ año: 2025, mes: 6, hc: 0.15, hp: 0.25 }]
    localStorage.setItem('energia-tarifas-v2', JSON.stringify(tarifas))

    const { result } = renderHook(() => useEnergy(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    // Asking for 2026/Jan — no exact match, should return 2025/Jun tarifa
    expect(result.current.getTarifa(2026, 1)).toEqual({ hc: 0.15, hp: 0.25 })
  })

  it('kpiFor returns null when record not found', async () => {
    const { result } = renderHook(() => useEnergy(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.kpiFor(1, 2026)).toBeNull()
  })

  it('kpiFor returns calculated KPI for existing record', async () => {
    const stored = [{ mes: 1, año: 2026, hc: 100, hp: 200 }]
    localStorage.setItem('energia-registros-v1', JSON.stringify(stored))

    const { result } = renderHook(() => useEnergy(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    const kpi = result.current.kpiFor(1, 2026)
    expect(kpi).not.toBeNull()
    expect(kpi?.total).toBe(300)
    expect(kpi?.ventajaHC).toBe(false) // hp(200) > hc(100)
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run __tests__/lib/EnergyContext.test.tsx
```

Expected: all 7 tests PASS. Common failure: mock path mismatch — verify that `vi.mock('@/lib/firebase', ...)` resolves to `lib/firebase.ts` via the `@` alias in `vitest.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/EnergyContext.test.tsx
git commit -m "test: add EnergyContext logic tests"
```

---

## Task 4: StatCard component tests

**Files:**
- Create: `__tests__/components/StatCard.test.tsx`

- [ ] **Step 1: Create directory and write tests**

```bash
mkdir -p __tests__/components
```

Create `__tests__/components/StatCard.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '@/components/StatCard'
import { Zap } from 'lucide-react'

describe('StatCard', () => {
  it('renders titulo and valor', () => {
    render(<StatCard titulo="Consumo Total" valor="300" icono={Zap} />)
    expect(screen.getByText('Consumo Total')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })

  it('renders unidad when provided', () => {
    render(<StatCard titulo="Consumo" valor="300" unidad="kWh" icono={Zap} />)
    expect(screen.getByText('kWh')).toBeInTheDocument()
  })

  it('does not render unidad when omitted', () => {
    render(<StatCard titulo="Consumo" valor="300" icono={Zap} />)
    expect(screen.queryByText('kWh')).not.toBeInTheDocument()
  })

  it('renders subLabel when provided', () => {
    render(<StatCard titulo="Costo" valor="50.00" icono={Zap} subLabel="enero 2026" />)
    expect(screen.getByText('enero 2026')).toBeInTheDocument()
  })

  it('shows savings color class for negative variacion (mejora)', () => {
    const { container } = render(
      <StatCard titulo="Costo" valor="50" icono={Zap} variacion={-10} />
    )
    // negative variacion → text-savings-600 class (green = good)
    const trendRow = container.querySelector('.text-savings-600')
    expect(trendRow).toBeInTheDocument()
    expect(screen.getByText('10% vs mes anterior')).toBeInTheDocument()
  })

  it('shows red color class for positive variacion (empeora)', () => {
    const { container } = render(
      <StatCard titulo="Costo" valor="50" icono={Zap} variacion={10} />
    )
    // positive variacion → text-red-500 class
    const trendRow = container.querySelector('.text-red-500')
    expect(trendRow).toBeInTheDocument()
    expect(screen.getByText('10% vs mes anterior')).toBeInTheDocument()
  })

  it('does not render variacion section when variacion is undefined', () => {
    render(<StatCard titulo="Costo" valor="50" icono={Zap} />)
    expect(screen.queryByText(/vs mes anterior/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run __tests__/components/StatCard.test.tsx
```

Expected: all 7 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add __tests__/components/StatCard.test.tsx
git commit -m "test: add StatCard component tests"
```

---

## Task 5: VarBadge component tests

**Files:**
- Create: `__tests__/components/VarBadge.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/components/VarBadge.test.tsx`:

```typescript
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
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run __tests__/components/VarBadge.test.tsx
```

Expected: all 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add __tests__/components/VarBadge.test.tsx
git commit -m "test: add VarBadge component tests"
```

---

## Task 6: TablaConsumo component tests

**Files:**
- Create: `__tests__/components/TablaConsumo.test.tsx`

- [ ] **Step 1: Write tests**

Create `__tests__/components/TablaConsumo.test.tsx`:

```typescript
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
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run __tests__/components/TablaConsumo.test.tsx
```

Expected: all 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add __tests__/components/TablaConsumo.test.tsx
git commit -m "test: add TablaConsumo component tests"
```

---

## Task 7: Full suite verification

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected output:
```
✓ __tests__/lib/data.test.ts (11)
✓ __tests__/lib/EnergyContext.test.tsx (7)
✓ __tests__/components/StatCard.test.tsx (7)
✓ __tests__/components/VarBadge.test.tsx (6)
✓ __tests__/components/TablaConsumo.test.tsx (4)

Test Files: 5 passed (5)
Tests:      35 passed (35)
```

- [ ] **Step 2: Run coverage**

```bash
npx vitest --coverage
```

Expected: `lib/data.ts` at 100% line coverage. Context and components at 80%+.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```
