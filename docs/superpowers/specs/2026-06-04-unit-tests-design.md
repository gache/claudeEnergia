# Unit Tests Design — claudeEnergía

**Date:** 2026-06-04  
**Scope:** Full coverage — pure functions, EnergyContext, React components  
**Stack:** Vitest + @testing-library/react + jsdom

---

## Architecture

Three test layers in `__tests__/`:

```
__tests__/
  lib/
    data.test.ts          # pure function tests (no mocks)
    EnergyContext.test.tsx # context tests (mock Firebase + localStorage)
  components/
    StatCard.test.tsx     # UI component tests
    VarBadge.test.tsx
    TablaConsumo.test.tsx
```

Config files at project root: `vitest.config.ts`, `vitest.setup.ts`

---

## Dependencies

```
vitest
@vitest/coverage-v8
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
jsdom
```

---

## Layer 1 — lib/data.ts (6-8 tests)

File: `__tests__/lib/data.test.ts`

| Test | What it verifies |
|------|-----------------|
| `calcularKPI` normal | total, costoHC, costoHP, costoTotal computed correctly |
| `calcularKPI` zero consumption | pctHC=0, pctHP=0, ventajaHC=false — no Infinity |
| `calcularKPI` HC >= HP | ventajaHC=true |
| `calcularKPI` HP > HC | ventajaHC=false |
| `calcularKPI` custom tarifa | uses provided tarifa, not defaults |
| `calcularTotales` empty | returns all zeros |
| `calcularTotales` multiple | sums all fields correctly, ventajaMeses count correct |
| `fmt` / `fmtNum` | correct decimal rounding |

---

## Layer 2 — EnergyContext (4-5 tests)

File: `__tests__/lib/EnergyContext.test.tsx`

Mocks:
- Firebase: `vi.mock('../lib/firebase')` — returns stub `db`
- Firestore: `vi.mock('firebase/firestore')` — stub `onSnapshot`, `setDoc`
- localStorage: `vi.stubGlobal('localStorage', mockLocalStorage)`

| Test | What it verifies |
|------|-----------------|
| initial load from localStorage | registros/tarifas hydrated on mount |
| `addOrUpdate` new record | adds to registros array |
| `addOrUpdate` existing record | updates matching mes+año |
| `getTarifa` exact match | returns correct tarifa for año/mes |
| `getTarifa` fallback | returns most recent tarifa when no exact match |

---

## Layer 3 — Components (4-5 tests)

File: `__tests__/components/StatCard.test.tsx`

| Test | What it verifies |
|------|-----------------|
| `StatCard` renders value + label | correct text content |
| `StatCard` with unit | unit displayed alongside value |
| `VarBadge` positive variation | green color class applied |
| `VarBadge` negative variation | red color class applied |
| `TablaConsumo` renders rows | one row per KPIMensual in props |

---

## npm script

Add to `package.json`:
```json
"test": "vitest",
"test:coverage": "vitest --coverage"
```

---

## Constraints

- No tests for Firebase write paths (too coupled to Firestore internals — integration test territory)
- Components tested via rendered output, not implementation details
- Mock scope: Firebase and localStorage only; no other global mocks

---

## Success Criteria

- `npm test` passes with zero failures
- All 8 regression cases from prior bug fixes covered (Infinity%, ventajaHC, zero consumption)
- TypeScript strict mode compatible
