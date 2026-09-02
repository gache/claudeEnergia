"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { KPIMensual } from "@/lib/data";
import { MESES } from "@/lib/data";

interface Props {
  data: KPIMensual[];
}

// ── 3D Bar Shape ────────────────────────────────────────────
const DEPTH = 6;

function make3DBar(isHC: boolean) {
  const front = isHC ? "#3b82f6" : "#dc2626";
  const top   = isHC ? "#93c5fd" : "#fca5a5";
  const side  = isHC ? "#1e40af" : "#7f1d1d";

  return function Bar3D({ x, y, width, height }: any) {
    if (!height || height <= 0) return <g />;
    const d = DEPTH;

    const frontPath = `M ${x},${y + height} L ${x},${y} L ${x + width},${y} L ${x + width},${y + height} Z`;
    const topPath   = `M ${x},${y} L ${x + d},${y - d} L ${x + width + d},${y - d} L ${x + width},${y} Z`;
    const sidePath  = `M ${x + width},${y} L ${x + width + d},${y - d} L ${x + width + d},${y + height - d} L ${x + width},${y + height} Z`;

    return (
      <g>
        <path d={sidePath}  fill={side}  />
        <path d={frontPath} fill={front} />
        <path d={topPath}   fill={top}   />
      </g>
    );
  };
}

const Bar3DHC = make3DBar(true);
const Bar3DHP = make3DBar(false);

// ── Tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card-lg p-4 min-w-[160px]">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mt-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.dataKey === "HC" ? "#3b82f6" : "#dc2626" }} />
            <span className="text-xs text-slate-500">{p.name}</span>
          </div>
          <span className="text-sm font-bold tabular-nums"
            style={{ color: p.dataKey === "HC" ? "#3b82f6" : "#dc2626" }}>
            {p.value.toFixed(1)} kWh
          </span>
        </div>
      ))}
      <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex justify-between">
        <span className="text-xs text-slate-400">Total</span>
        <span className="text-xs font-bold text-slate-700 tabular-nums">{total.toFixed(1)} kWh</span>
      </div>
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────
export default function ConsumoBarChart({ data }: Props) {
  const chartData = data.map(d => ({
    mes: MESES[d.mes - 1].slice(0, 3),
    HC: d.hc,
    HP: d.hp,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} barGap={4} barCategoryGap="30%">
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#cbd5e1" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(241,245,249,0.7)", rx: 6, ry: 6 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 14 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="HC"
          name="HC (Creuses)"
          fill="#3b82f6"
          shape={<Bar3DHC />}
          maxBarSize={28}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="HP"
          name="HP (Pleines)"
          fill="#dc2626"
          shape={<Bar3DHP />}
          maxBarSize={28}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
