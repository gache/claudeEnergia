# claudeEnergía

Dashboard de análisis energético para consumo eléctrico doméstico/industrial, con separación por tarifa horaria **HC (Heures Creuses)** y **HP (Heures Pleines)**.

## Funcionalidades

### Dashboard principal
- KPIs del mes actual: consumo HC/HP, coste total, diferencia tarifaria
- Participación del consumo y desglose de costes con barras visuales
- Comparativa interanual automática (mes actual año N vs año N−1) con variación porcentual
- Gráficos de evolución mensual de consumo HC/HP y costes
- Tabla de últimos 3 meses con variaciones % por categoría
- Año dinámico: siempre muestra el año en curso sin configuración manual

### Historial
- Vista anual con selector de año (2022–año actual)
- Tabla detallada mes a mes: kWh HC/HP, costes, porcentajes y diferencia HC–HP
- Totales y promedios anuales en footer de tabla
- Proyección anual basada en consumo acumulado
- Alerta automática cuando el ratio HP > 40% del total
- Exportación a CSV del año seleccionado
- Gráficos de consumo y costes para el año seleccionado

### Comparativa
- Análisis interanual mes a mes lado a lado con selector dinámico de años
- Prevención de selección del mismo año en ambos selectores
- Variación porcentual por categoría: HC, HP y total
- KPIs resumen: media de variación de consumo y costes, mejor mes
- Indicadores visuales de ahorro o incremento

### Registro de consumo
- Formulario para introducir kWh HC y HP por mes y año
- Vista previa en tiempo real de KPIs antes de guardar
- Detección de registro existente con opción de cargar y editar
- Eliminación de registros con confirmación de dos pasos
- Años disponibles: 2022–año actual (se extiende automáticamente)

### Gestión de tarifas
- Tarifas editables desde la barra lateral
- Soporte de tarifas mensuales: cada mes puede tener precio diferente
- Lógica de fallback: si no hay tarifa para un mes, usa la más reciente anterior
- Ratio HP/HC visible en tiempo real

### Simulador de consumo
- Estimación de coste según distribución HC/HP personalizada
- Comparación contra consumo real registrado

## KPIs calculados

| KPI | Descripción |
|-----|-------------|
| Consumo total | HC + HP en kWh |
| Coste HC | kWh HC × tarifa HC vigente |
| Coste HP | kWh HP × tarifa HP vigente |
| Coste total | Coste HC + Coste HP |
| % HC / % HP | Participación de cada tarifa sobre el total |
| Dif. HP − HC | Diferencia absoluta (azul = ventaja HC, rojo = domina HP) |
| Variación % | Cambio respecto al mismo mes del año anterior |
| Ventaja HC | Ahorro estimado por concentrar consumo en horas valle |

## Stack técnico

- **Next.js 14** — App Router con TypeScript
- **React Context + localStorage** — estado global con caché offline
- **Firebase Firestore + Auth** — sincronización en tiempo real y autenticación anónima
- **Tailwind CSS** — tokens personalizados (paletas HC, HP, brand)
- **Recharts** — gráficos de área, línea y barras
- **Lucide React** — iconografía

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Requiere `.env.local` con las 6 variables de Firebase (`NEXT_PUBLIC_FIREBASE_*`). Sin ellas, la app funciona offline usando localStorage.

## Arquitectura de datos

```
familias/hogar/data/profile (Firestore)
├── registros: RegistroMensual[]   # { mes, año, hc, hp }
├── tarifas:   TarifaMensual[]     # { año, mes, hc, hp } €/kWh
└── updatedAt: timestamp
```

Escrituras debounced (60 s) para minimizar cuota Firestore. localStorage actúa como caché inmediata — la app funciona sin conexión.
