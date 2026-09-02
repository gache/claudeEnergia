"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  hcPct: number;
  hpPct: number;
  hcKwh: number;
  hpKwh: number;
  total: number;
  unit?: string;
  decimals?: number;
  layout?: "default" | "featured";
}

export default function DonutHCHP({
  hcPct, hpPct, hcKwh, hpKwh, total,
  unit = "kWh", decimals = 0, layout = "default",
}: Props) {
  const data = [
    { name: "HC", value: parseFloat(hcPct.toFixed(1)) },
    { name: "HP", value: parseFloat(hpPct.toFixed(1)) },
  ];

  const chart = (
    <div className="relative" style={{ height: layout === "featured" ? 200 : 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={layout === "featured" ? 62 : 52}
            outerRadius={layout === "featured" ? 90 : 78}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            <Cell fill="#3b82f6" />
            <Cell fill="#dc2626" />
          </Pie>
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)}%`]}
            contentStyle={{
              borderRadius: 12, border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,.10)",
              fontSize: 12, padding: "8px 12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`font-black text-slate-900 tabular-nums leading-none ${layout === "featured" ? "text-3xl" : "text-2xl"}`}>
          {total.toFixed(decimals)}
        </span>
        <span className="text-xs text-slate-400 font-medium mt-0.5">{unit} total</span>
      </div>
    </div>
  );

  if (layout === "featured") {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        {/* HC side */}
        <div className="flex-1 min-w-0 text-center space-y-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-hc-600">HC</p>
          <p className="text-2xl sm:text-4xl font-black text-hc-700 tabular-nums leading-none">{hcPct.toFixed(1)}<span className="text-base sm:text-xl">%</span></p>
          <p className="text-xs font-mono text-hc-500">{hcKwh.toFixed(decimals)} {unit}</p>
        </div>

        {/* Donut */}
        <div className="flex-shrink-0 w-[140px] sm:w-[180px]">{chart}</div>

        {/* HP side */}
        <div className="flex-1 min-w-0 text-center space-y-1">
          <div className="w-3 h-3 rounded-full bg-red-600 mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-hp-600">HP</p>
          <p className="text-2xl sm:text-4xl font-black text-hp-700 tabular-nums leading-none">{hpPct.toFixed(1)}<span className="text-base sm:text-xl">%</span></p>
          <p className="text-xs font-mono text-hp-500">{hpKwh.toFixed(decimals)} {unit}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
              dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}
              animationDuration={800} animationEasing="ease-out">
              <Cell fill="#3b82f6" />
              <Cell fill="#dc2626" />
            </Pie>
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`]}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.10)", fontSize: 12, padding: "8px 12px" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">{total.toFixed(decimals)}</span>
          <span className="text-xs text-slate-400 font-medium mt-0.5">{unit} total</span>
        </div>
      </div>
      <div className="w-full space-y-2.5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-700">HC (Creuses)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-blue-600 tabular-nums">{hcPct.toFixed(1)}%</span>
            <span className="text-xs text-slate-400 font-mono">{hcKwh.toFixed(decimals)} {unit}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-700">HP (Pleines)</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-red-600 tabular-nums">{hpPct.toFixed(1)}%</span>
            <span className="text-xs text-slate-400 font-mono">{hpKwh.toFixed(decimals)} {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
