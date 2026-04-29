# claudeEnergía — Design System v2.0
*Established by ui-ux-elevate agent — 2026-04-29*

---

## Color Tokens

### Brand (Navy Blue — Primary Actions, Sidebar Header)
- `brand-600` `#2563eb` — buttons, active nav
- `brand-700` `#1d4ed8` — hover state
- `brand-800` `#1e3a8a` — sidebar bg gradient top
- `brand-950` `#0f172a` — sidebar bg gradient bottom

### Navy (Sidebar Background Gradient)
- Gradient: `linear-gradient(180deg, #0f1f45 0%, #0a1628 60%, #080f2a 100%)`
- Nav inactive text: `slate-400`
- Nav active bg: `brand-600`

### HC (Heures Creuses — Cyan/Teal)
- Primary: `hc-500` `#06b6d4`
- Background: `hc-50` `#ecfeff`
- Border: `hc-200` `#a5f3fc`
- Text: `hc-700` `#0e7490`

### HP (Heures Pleines — Amber/Orange)
- Primary: `hp-500` `#f59e0b`
- Background: `hp-50` `#fffbeb`
- Border: `hp-200` `#fde68a`
- Text: `hp-700` `#b45309`

### Savings/Positive (Emerald Green)
- Primary: `savings-600` `#059669`
- Background: `savings-50` `#ecfdf5`
- Used for: decreasing consumption (good), ventajaHC

### Warning/Negative (Red/Orange)
- Used for: increasing consumption (bad), ventajaHP
- `red-50`, `red-500`, `red-600`

### Chart Colors
- HC line/bar: `#06b6d4` (hc-500)
- HP line/bar: `#f59e0b` (hp-500)
- Total line: `#8b5cf6` (violet-500, dashed)
- Year base comparison: `#94a3b8` (slate-400)
- Year current comparison: `#3b82f6` (brand-500)

---

## Typography Scale

### Font Family
- Primary: `Inter` (Google Fonts) via `next/font/google`
- Monospace: `JetBrains Mono` — used for numbers, tariffs, kWh values
- CSS variable: `--font-inter`

### Hierarchy
- Page title: `text-2xl font-bold text-slate-900`
- Section header: `text-base font-semibold text-slate-700` (`.section-title`)
- KPI label: `text-[11px] font-semibold uppercase tracking-widest text-slate-400` (`.kpi-label`)
- KPI value: `text-[28px] font-bold tabular-nums tracking-tight` (`.kpi-value`)
- Table header: `text-xs font-semibold uppercase tracking-wider text-slate-500`
- Badge text: `text-xs font-semibold`
- Sub-label/meta: `text-xs text-slate-400`
- Tariff display: `font-mono text-xs font-semibold`

---

## Spacing & Layout

### Container
- `main > div`: `p-6 lg:p-8 max-w-[1600px] mx-auto`
- Page vertical gaps: `space-y-7`

### Cards
- Border radius: `rounded-2xl`
- Padding: `p-5` (compact), `p-6` (standard)
- Shadow levels:
  - `shadow-card`: `0 1px 3px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)`
  - `shadow-card-md`: `0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.07)`
  - `shadow-card-lg`: `0 10px 15px -3px rgba(0,0,0,.08)` (hover state)

### KPI Grid
- Mobile: `grid-cols-2`
- Desktop: `grid-cols-4`
- Gap: `gap-4`

### Chart Grid
- Below xl: `grid-cols-1`
- xl+: `grid-cols-2`
- Gap: `gap-5`

---

## Component Patterns

### KPI Card
- Top border accent (3px): color depends on data type
- Icon badge top-right: 8×8 rounded-lg with colored bg
- Value: large tabular font
- Trend indicator: color-coded TrendingUp/Down icon + percentage

### Tarifa Cards (HC/HP)
- Gradient background from light to lighter
- Participation bar (thin, colored)
- Cost and tariff display

### VentajaCard
- Dual-color split bar for HC/HP visualization
- Green (savings) when HC dominates, red when HP dominates

### Charts
- Custom tooltips with card-style containers
- Vertical gridlines removed, horizontal only
- No axis lines, no tick lines
- Legend with circle icons, 12px font

### Badges
- `.badge` base: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold`
- `.badge-hc`: cyan
- `.badge-hp`: amber
- `.badge-positive`: red (higher = bad for energy)
- `.badge-negative`: emerald (lower = good)

### Form Inputs
- `.input-base`: standard input with brand focus ring
- `.input-hc`: cyan border + focus ring
- `.input-hp`: amber border + focus ring

### Buttons
- `.btn-primary`: brand-600 bg, white text, shadow-sm
- `.btn-secondary`: white bg, slate border

---

## Interaction States

- Hover on cards: `hover:shadow-card-lg transition-shadow duration-200`
- Hover on nav items: `hover:bg-white/10 hover:text-white`
- Hover on table rows: `hover:bg-slate-50/70 transition-colors duration-100`
- Focus on inputs: `focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400`
- Min touch target: `min-h-[44px]` on all interactive elements

---

## Animations

- Page entry: `animate-fade-in` (0.3s ease-out)
- Card entry: `animate-slide-up` (0.3s ease-out, 8px translate)
- Progress bars: `transition-all duration-500/700`
- Skeleton loader: shimmer animation defined in globals.css

---

## Accessibility

- WCAG AA contrast maintained throughout:
  - All text-slate-400 on white bg passes AA
  - All colored text (hc-700, hp-700, brand-700) pass AA on their respective light backgrounds
- Min touch targets: 44px height enforced on nav items, buttons
- `tabular-nums` on all numeric values for column alignment
- `antialiased` on body element

---

## Sidebar Architecture

- Fixed width: `w-64` (256px)
- Background: deep navy gradient
- Brand header with Zap icon in brand-600 rounded-xl
- Navigation with icon badges and sub-descriptions
- Tariff widget at bottom with colored dots
- Footer version tag
- Nav items: icon bg container + label + description + active dot indicator

---

## Page Structure Pattern

Each page follows:
1. Badge row (contextual chips)
2. Page title `h1`
3. Subtitle/meta text
4. Action elements (year picker, etc.) — right-aligned
5. Content sections with `space-y-7` gap
6. Charts in 1-col → 2-col xl grid
7. Data table (full width)
