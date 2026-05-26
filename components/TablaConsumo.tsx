"use client";

import { KPIMensual, MESES, fmt, calcularTotales } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  showVarPct?: boolean;
};

function VarBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-300 text-xs">—</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
      up ? "bg-red-50 text-red-600 border border-red-100" : "bg-savings-50 text-savings-700 border border-savings-100"
    }`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function SplitBar({ pctHC, pctHP }: { pctHC: number; pctHP: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-hc-600 tabular-nums w-8 text-right">{pctHC.toFixed(0)}%</span>
      <div className="flex h-1.5 w-16 rounded-full overflow-hidden bg-slate-100">
        <div className="bg-hc-400 transition-all duration-500" style={{ width: `${pctHC}%` }} />
        <div className="bg-hp-400 transition-all duration-500" style={{ width: `${pctHP}%` }} />
      </div>
      <span className="text-[10px] font-bold text-hp-600 tabular-nums w-8">{pctHP.toFixed(0)}%</span>
    </div>
  );
}

export default function TablaConsumo({ data, showVarPct = true }: Props) {
  const { totalHC, totalHP, totalKwh, totalCostoHC, totalCostoHP, totalCosto, sumPctHC, sumPctHP } = calcularTotales(data);
  const avgPctHC = data.length > 0 ? sumPctHC / data.length : 0;
  const avgPctHP = data.length > 0 ? sumPctHP / data.length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden hover:shadow-card-lg transition-shadow duration-300">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-hc-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-hp-400" />
          </div>
          <h3 className="section-title">Detalle mensual</h3>
        </div>
        <span className="badge bg-slate-50 text-slate-500 border border-slate-200 text-[10px]">
          {data.length} mes{data.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr>
              <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/80 border-b border-slate-100">Mes</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hc-500 bg-hc-50/50 border-b border-slate-100">HC kWh</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hp-500 bg-hp-50/50 border-b border-slate-100">HP kWh</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/80 border-b border-slate-100">Total kWh</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hc-500 bg-hc-50/50 border-b border-slate-100">€ HC</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-hp-500 bg-hp-50/50 border-b border-slate-100">€ HP</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-50/80 border-b border-slate-100">€ Total</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/80 border-b border-slate-100">HC / HP</th>
              {showVarPct && (
                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/80 border-b border-slate-100">Var%</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const prev   = data[i - 1];
              const varPct = prev ? ((d.total - prev.total) / prev.total) * 100 : null;
              const isHC   = d.ventajaHC;
              return (
                <tr
                  key={`${d.año}-${d.mes}`}
                  className="group border-b border-slate-50 hover:bg-slate-50/60 transition-colors duration-100"
                >
                  {/* Month cell with colored left accent */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-6 rounded-full flex-shrink-0 ${isHC ? "bg-hc-400" : "bg-hp-400"}`} />
                      <div>
                        <span className="font-bold text-slate-800">{MESES[d.mes - 1]}</span>
                        <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isHC ? "bg-hc-50 text-hc-600" : "bg-hp-50 text-hp-600"
                        }`}>
                          {isHC ? "HC" : "HP"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* kWh columns */}
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-hc-700 tabular-nums bg-hc-50/20 group-hover:bg-hc-50/40 transition-colors">
                    {d.hc.toFixed(3)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-hp-700 tabular-nums bg-hp-50/20 group-hover:bg-hp-50/40 transition-colors">
                    {d.hp.toFixed(3)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800 tabular-nums">
                    {d.total.toFixed(3)}
                  </td>

                  {/* Cost columns */}
                  <td className="px-4 py-3.5 text-right font-mono text-hc-600 tabular-nums text-xs bg-hc-50/20 group-hover:bg-hc-50/40 transition-colors">
                    {fmt(d.costoHC)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-hp-600 tabular-nums text-xs bg-hp-50/20 group-hover:bg-hp-50/40 transition-colors">
                    {fmt(d.costoHP)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-700 tabular-nums text-xs">
                    {fmt(d.costoTotal)}
                  </td>

                  {/* HC/HP split bar */}
                  <td className="px-4 py-3.5 text-center">
                    <SplitBar pctHC={d.pctHC} pctHP={d.pctHP} />
                  </td>

                  {showVarPct && (
                    <td className="px-6 py-3.5 text-right">
                      <VarBadge pct={varPct} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>

          {/* Totals footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white">
              <td className="px-6 py-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Acumulado</span>
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-hc-700 tabular-nums bg-hc-50/30">
                {totalHC.toFixed(3)}
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-hp-700 tabular-nums bg-hp-50/30">
                {totalHP.toFixed(3)}
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                {totalKwh.toFixed(3)}
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-hc-700 tabular-nums text-xs bg-hc-50/30">
                {fmt(totalCostoHC)}
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-hp-700 tabular-nums text-xs bg-hp-50/30">
                {fmt(totalCostoHP)}
              </td>
              <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 tabular-nums text-xs">
                {fmt(totalCosto)}
              </td>
              <td className="px-4 py-4 text-center">
                <SplitBar pctHC={avgPctHC} pctHP={avgPctHP} />
              </td>
              {showVarPct && (
                <td className="px-6 py-4 text-right text-slate-300 font-mono text-xs">—</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
