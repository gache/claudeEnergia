# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando se trabaja con código en este repositorio.

## Descripción del Proyecto

**claudeEnergía** es un dashboard de análisis de consumo eléctrico doméstico/industrial con separación por tarifas horarias: **HC (Heures Creuses - fuera de punta)** y **HP (Heures Pleines - punta)**.

Propósito principal: Permitir a los usuarios monitorear, comparar (2025 vs 2026) y optimizar su consumo de electricidad basándose en la distribución tarifaria y el impacto económico.

## Stack Tecnológico

- **Next.js 14** — App Router con TypeScript
- **React Context + localStorage** — Gestión de estado global con fallback
- **Firebase Firestore** — Sincronización en tiempo real + persistencia
- **Firebase Auth** — Autenticación anónima (sin login explícito)
- **Tailwind CSS** — Utilidades de estilo con tokens personalizados
- **Recharts** — Gráficos de línea/barras para análisis temporal
- **Lucide React** — Librería de iconos

## Arquitectura y Flujo de Datos

### Capas de Gestión de Estado

1. **EnergyContext** (`lib/EnergyContext.tsx`) — Fuente única de verdad
   - Gestiona `registros` (registros mensuales de consumo) y `tarifas` (tasas de precios)
   - Se hidrata desde localStorage en el montaje, luego escucha Firestore en tiempo real
   - Escrituras debouncedas en Firestore (5s de retraso) para reducir uso de cuota
   - Siempre escribe en localStorage como caché local (incluso sin conexión)
   - Maneja migración de datos de la colección `/users` antigua

2. **AuthContext** (`lib/AuthContext.tsx`) — Estado de autenticación
   - Proporciona `user` (User | null) y bandera `loading`
   - Auto-inicia sesión de forma anónima si no existe usuario
   - Observa `onAuthStateChanged` para cambios de estado de autenticación

### Tipos de Datos (lib/data.ts)

```
RegistroMensual {
  mes: 1-12
  año: 2022-2026
  hc: number (kWh)
  hp: number (kWh)
}

KPIMensual extends RegistroMensual {
  total, costoHC, costoHP, costoTotal
  pctHC, pctHP, difHCHP, ventajaHC
  tarifaHC, tarifaHP
}

TarifaMensual {
  año, mes, hc (€/kWh), hp (€/kWh)
}
```

Funciones clave de cálculo: `calcularKPI()`, `calcularTotales()`, `fmt()`, `fmtNum()`

### Estructura Firebase

Ruta de base de datos: `familias/hogar/data/profile`

Campos:
- `registros: RegistroMensual[]`
- `tarifas: TarifaMensual[]`
- `updatedAt: timestamp`

Listener en tiempo real configurado en EnergyContext.useEffect (líneas 95-106).

### Enrutamiento (App Router)

- `/` — Dashboard con KPIs, comparación del mes actual, comparación anual 2025 vs 2026
- `/registro` — Formulario para añadir/editar registros mensuales; detecta datos existentes para modo edición
- `/historial` — Selector de año y tabla detallada mes a mes con gráficos
- `/calculadora` — Calculadora de consumo / estimador rápido
- `/comparativa` — Análisis lado a lado 2025 vs 2026 con variación %

## Comandos Comunes de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (localhost:3000)
npm run dev

# Compilar bundle de producción
npm build

# Iniciar servidor de producción (después de build)
npm start

# Linting con ESLint (sin fix)
npm run lint
```

## Workflow de Commits y Push

**Patrón obligatorio**:
- **Cada cambio** → Hacer un commit en local (incluso cambios pequeños)
- **Cada 5 commits acumulados** → Hacer un push a GitHub

Esto mantiene un historial granular de cambios mientras agrupa los pushes remotos para reducir ruido en el repositorio remoto.

## Configuración de Entorno

Variables requeridas en `.env.local` (configuración de Firebase):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

El prefijo `NEXT_PUBLIC_` expone estas variables al navegador (requerido para Firebase SDK del lado cliente).

## Patrones y Convenciones Clave

### Uso de Context

Siempre envuelve proveedores en este orden (ver `layout.tsx`):
```
<AuthProvider>
  <EnergyProvider>
    <ProtectedLayout>
      ...children
    </ProtectedLayout>
  </EnergyProvider>
</AuthProvider>
```

### Usando EnergyContext

```typescript
import { useEnergy } from "@/lib/EnergyContext";

const { registros, tarifas, addOrUpdate, getTarifa, kpiFor, getByYear } = useEnergy();
```

### Estrategia de Sincronización Firestore

- **Lectura**: Escucha actualizaciones en tiempo real via `onSnapshot()`; las escrituras siempre ocurren en localStorage inmediatamente
- **Escritura**: Llama a `addOrUpdate(registro)` o `setTarifa()`; los cambios se sincronizan automáticamente con Firestore cada 5 segundos (debounce)
- **Sin conexión**: La app funciona desde localStorage si Firestore no está disponible; los cambios se colean y sincronizan cuando hay conexión
- **Optimización de cuota**: El debounce previene escrituras excesivas; solo se dispara cuando hay cambios reales en los datos

### Sistema de Diseño (Tailwind)

Tokens personalizados en `tailwind.config.ts`:
- **Colores HC** — `bg-blue-50`, `text-blue-600`, etc. (branding fuera de punta)
- **Colores HP** — `bg-red-50`, `text-red-600`, etc. (branding punta)
- **Paleta brand** — Slate, green, amber para UI neutral
- **Fuentes**: Inter (cuerpo), Sora (encabezados), JetBrains Mono (datos)

## Notas Importantes de Implementación

1. **Cálculo de Datos**: Todas las métricas KPI se derivan via `calcularKPI()` en tiempo de renderizado desde registro + tarifa. Nunca almacenes valores calculados por separado.

2. **Lógica de Fallback de Tarifa** (`getTarifa(año, mes)`): Si no existe tarifa exacta para mes/año, usa la tasa más reciente anterior. El fallback por defecto es `TARIFA_HC` (0.19008) y `TARIFA_HP` (0.27436).

3. **Sincronización en Tiempo Real**: EnergyContext escucha en un único documento Firestore, así que todos los clientes ven cambios en segundos. El debounce previene tormentas de escritura.

4. **Responsividad Móvil**: Sidebar (escritorio) se intercambia con MobileNav (móvil) via breakpoints `md:`. El contenido principal se reajusta automáticamente con `max-w-[1600px]`.

5. **Manejo de Timestamps**: Usa Firebase `serverTimestamp()` para `updatedAt` para evitar sesgo de reloj.

6. **Organización de Componentes**: Gráficos (Recharts) y tablas están en `components/`. Mantén cálculos en `lib/data.ts`, no en componentes.

## Depuración y Resolución de Problemas

- **Firestore no sincroniza**: Revisa la consola del navegador para errores de configuración de Firebase. Verifica que `.env.local` tenga las 6 claves.
- **Datos no persisten**: Inspecciona localStorage (`energia-registros-v1`, `energia-tarifas-v2`) y Firestore en `familias/hogar/data/profile`.
- **Conflictos de debounce**: Si necesitas escrituras inmediatas, ajusta el timeout en EnergyContext línea 138 (actualmente 5000ms).
- **Errores de compilación**: Asegúrate que TypeScript sea estricto; revisa la configuración en `tsconfig.json` antes de flexibilizar.

## Datos Iniciales

Registros de consumo y tarifas por defecto están sedeados en `lib/data.ts` (`datosIniciales`, `TARIFAS_INICIALES`). Estos se cargan si el documento Firestore no existe.
