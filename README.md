# claudeEnergía

Dashboard de análisis energético para consumo eléctrico doméstico/industrial, con separación por tarifa horaria **HC (Heures Creuses)** y **HP (Heures Pleines)**.

## Funcionalidades

### Dashboard principal
- KPIs del mes actual: consumo total, coste total, desglose HC y HP
- Indicador de ventaja tarifaria: muestra si el consumo se concentra en HC (barato) o HP (caro)
- Comparativa interanual automática (Abril 2025 vs Abril 2026) con variación porcentual
- Gráficos de evolución mensual de consumo y costes

### Historial
- Vista anual con selector de año (2022–2026)
- Tabla detallada mes a mes: kWh HC/HP, costes, porcentajes y diferencia HC–HP
- Totales y promedios anuales en el footer de la tabla
- Gráficos de consumo y costes para el año seleccionado

### Comparativa 2025 / 2026
- Análisis interanual mes a mes lado a lado
- Variación porcentual por categoría: HC, HP y total
- Indicadores visuales de ahorro o incremento

### Registro de consumo
- Formulario para introducir kWh HC y HP por mes y año
- Vista previa en tiempo real de KPIs antes de guardar
- Detección de registro existente con opción de cargar y editar
- Años disponibles: 2022–2026

### Gestión de tarifas
- Tarifas editables directamente desde la barra lateral
- Soporte de tarifas mensuales: cada mes puede tener un precio diferente
- Lógica de paso: si no hay tarifa definida para un mes, se aplica la más reciente anterior
- Ratio HP/HC visible en tiempo real

## KPIs calculados

| KPI | Descripción |
|-----|-------------|
| Consumo total | HC + HP en kWh |
| Coste HC | kWh HC × tarifa HC vigente |
| Coste HP | kWh HP × tarifa HP vigente |
| Coste total | Coste HC + Coste HP |
| % HC / % HP | Participación de cada tarifa sobre el total |
| Dif. HP − HC | Diferencia absoluta entre tarifas (azul = ventaja HC, rojo = domina HP) |
| Variación % | Cambio respecto al mismo mes del año anterior |

## Stack técnico

- **Next.js 14** — App Router
- **React Context + localStorage** — estado global persistente
- **Tailwind CSS** — diseño con tokens personalizados (paletas HC, HP, brand)
- **Recharts** — gráficos de evolución
- **Lucide React** — iconografía

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).
