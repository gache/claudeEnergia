# CLAUDE.md

## Proyecto

**claudeEnergía** — Dashboard HC/HP (Heures Creuses/Pleines) para análisis de consumo eléctrico con comparativa tarifaria 2025 vs 2026.

## Stack

Next.js 14 (App Router) · TypeScript · React Context + localStorage · Firebase Firestore/Auth (anónimo) · Tailwind CSS · Recharts · Lucide React

## Tipos (`lib/data.ts`)

```
RegistroMensual: { mes, año, hc, hp } (kWh)
KPIMensual: extiende RegistroMensual + costos/porcentajes calculados
TarifaMensual: { año, mes, hc, hp } (€/kWh)
```
Funciones: `calcularKPI()`, `calcularTotales()`, `fmt()`, `fmtNum()`

## Arquitectura

- **EnergyContext** (`lib/EnergyContext.tsx`) — Fuente única de verdad. localStorage → Firestore onSnapshot. Escrituras debounced 5s.
- **AuthContext** (`lib/AuthContext.tsx`) — Auth anónima automática.
- **Firebase path**: `familias/hogar/data/profile` → `{ registros[], tarifas[], updatedAt }`
- **Datos semilla**: `datosIniciales`, `TARIFAS_INICIALES` en `lib/data.ts` (si Firestore vacío)
- **Fallback tarifa**: `getTarifa(año, mes)` usa tasa más reciente. Default: HC=0.19008, HP=0.27436

## Rutas

`/` Dashboard · `/registro` Añadir/editar · `/historial` Tabla anual + gráficos · `/calculadora` Estimador · `/comparativa` 2025 vs 2026

## Convenciones críticas

**Provider order** (`layout.tsx`):
```tsx
<AuthProvider><EnergyProvider><ProtectedLayout>…</ProtectedLayout></EnergyProvider></AuthProvider>
```

**Hook**:
```typescript
const { registros, tarifas, addOrUpdate, getTarifa, kpiFor, getByYear } = useEnergy();
```

**Cálculos**: Solo via `calcularKPI()` en `lib/data.ts`. Nunca almacenar KPIs calculados.
**Componentes**: Gráficos/tablas en `components/`. Cálculos en `lib/`.

## Commits

- **Cada cambio** → commit local
- **Cada 5 commits** → push a GitHub

## Entorno (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / STORAGE_BUCKET / MESSAGING_SENDER_ID / APP_ID
```

## Dev

```bash
npm run dev    # localhost:3000
npm run build
npm run lint
```

## Debug

- localStorage: `energia-registros-v1`, `energia-tarifas-v2`
- Debounce timeout: `EnergyContext.tsx` línea 138 (5000ms)
- Sidebar ↔ MobileNav vía `md:` breakpoint (`max-w-[1600px]`)
