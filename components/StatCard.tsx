import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";

type Props = {
  titulo: string;
  valor: string;
  unidad?: string;
  subLabel?: string;
  icono: LucideIcon;
  variacion?: number;
  colorIcono?: string;
  accentColor?: "brand" | "hc" | "hp" | "violet" | "savings";
  staggerDelay?: number;
};

const accentMap: Record<string, { iconBg: string; iconColor: string; border: string; glowShadow: string }> = {
  brand:   { iconBg: "bg-indigo-100/60", iconColor: "text-indigo-600", border: "border border-indigo-200/40", glowShadow: "group-hover:shadow-glow-brand" },
  hc:      { iconBg: "bg-cyan-100/70",    iconColor: "text-cyan-600",    border: "border border-cyan-200/50", glowShadow: "group-hover:shadow-glow-hc" },
  hp:      { iconBg: "bg-amber-100/70",    iconColor: "text-amber-600",    border: "border border-amber-200/50", glowShadow: "group-hover:shadow-glow-hp" },
  violet:  { iconBg: "bg-violet-100/60", iconColor: "text-violet-600", border: "border border-violet-200/40", glowShadow: "group-hover:shadow-violet-500/20" },
  savings: { iconBg: "bg-emerald-100/60", iconColor: "text-emerald-600", border: "border border-emerald-200/40", glowShadow: "group-hover:shadow-green-500/20" },
};

export default function StatCard({
  titulo, valor, unidad, subLabel, icono: Icono,
  variacion, colorIcono, accentColor = "brand", staggerDelay = 0,
}: Props) {
  const cfg = accentMap[accentColor] ?? accentMap.brand;
  const baja = variacion !== undefined && variacion < 0;
  const sube = variacion !== undefined && variacion > 0;

  const delayStyle = {
    animationDelay: `${staggerDelay}ms`,
  } as React.CSSProperties;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${cfg.border} p-5
        hover:shadow-sm transition-shadow duration-300 group cursor-pointer
        animate-slide-up ${cfg.glowShadow}`}
      style={delayStyle}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{titulo}</p>
        <div className={`w-8 h-8 rounded-lg ${cfg.iconBg} ${colorIcono ?? cfg.iconColor} flex items-center justify-center flex-shrink-0
          transition-all duration-300`}>
          <Icono className="w-4 h-4" />
        </div>
      </div>

      <p className="text-[28px] font-bold tabular-nums tracking-tight text-slate-800 leading-none font-display
        group-hover:text-slate-900 transition-colors">
        {valor}
        {unidad && <span className="text-sm font-normal text-slate-500 ml-1.5">{unidad}</span>}
      </p>

      {subLabel && (
        <p className="text-xs text-slate-500 mt-1">{subLabel}</p>
      )}

      {variacion !== undefined && (
        <div className={`flex items-center gap-1 mt-3 pt-3 border-t border-slate-50 text-xs font-semibold
          transition-all duration-300 group-hover:gap-2 ${
            baja ? "text-emerald-600" : sube ? "text-red-500" : "text-slate-400"
          }`}>
          {baja
            ? <TrendingDown className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            : sube
              ? <TrendingUp className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
              : <Minus className="w-3.5 h-3.5" />
          }
          <span>{Math.abs(variacion)}% vs mes anterior</span>
        </div>
      )}
    </div>
  );
}
