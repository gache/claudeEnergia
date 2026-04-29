import { KPIMensual, MESES, fmt, calcularTotales } from "@/lib/data";

type Props = {
  data: KPIMensual[];
  showVarPct?: boolean;
};

function VarBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-300 text-sm">—</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      up
        ? "bg-red-50 text-red-600 border border-red-100"
        : "bg-savings-50 text-savings-700 border border-savings-100"
    }`}>
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function VentajaBadge({ ventajaHC }: { ventajaHC: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
      ventajaHC
        ? "bg-cyan-50 text-cyan-700 border border-cyan-100"
        : "bg-amber-50 text-amber-700 border border-amber-100"
    }`}>
      {ventajaHC ? "HC" : "HP"}
    </span>
  );
}

export default function TablaConsumo({ data, showVarPct = true }: Props) {
  const { totalHC, totalHP, totalKwh, totalCostoHC, totalCostoHP, totalCosto, sumPctHC, sumPctHP } = calcularTotales(data);
  const avgPctHC = data.length > 0 ? sumPctHC / data.length : 0;
  const avgPctHP = data.length > 0 ? sumPctHP / data.length : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden">
      {/* Table header bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="section-title">Detalle mensual</h3>
        <span className="text-xs text-slate-400">{data.length} meses registrados</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mes</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">HC kWh</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">HP kWh</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Total kWh</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-600">€ HC</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-600">€ HP</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">€ Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hc-500">% HC</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-hp-500">% HP</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Dif</th>
              {showVarPct && (
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Var%</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const prev   = data[i - 1];
              const varPct = prev ? ((d.total - prev.total) / prev.total) * 100 : null;
              return (
                <tr
                  key={`${d.año}-${d.mes}`}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors duration-100"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{MESES[d.mes - 1]}</span>
                      <VentajaBadge ventajaHC={d.ventajaHC} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-hc-700">{d.hc}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-hp-700">{d.hp}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">{d.total}</td>
                  <td className="px-4 py-3 text-right font-mono text-hc-600">{fmt(d.costoHC)}</td>
                  <td className="px-4 py-3 text-right font-mono text-hp-600">{fmt(d.costoHP)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">{fmt(d.costoTotal)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold text-hc-600 bg-hc-50 px-2 py-0.5 rounded-full">
                      {fmt(d.pctHC, 1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold text-hp-600 bg-hp-50 px-2 py-0.5 rounded-full">
                      {fmt(d.pctHP, 1)}%
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-xs font-semibold ${
                    d.difHCHP > 0 ? "text-red-500" : "text-hc-600"
                  }`}>
                    {Math.abs(d.difHCHP)}
                  </td>
                  {showVarPct && (
                    <td className="px-5 py-3 text-right">
                      <VarBadge pct={varPct} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200 font-semibold">
              <td className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                Total / Prom.
              </td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-hc-700">{totalHC}</td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-hp-700">{totalHP}</td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">{totalKwh}</td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-hc-700">{fmt(totalCostoHC)}</td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-hp-700">{fmt(totalCostoHP)}</td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">{fmt(totalCosto)}</td>
              <td className="px-4 py-3.5 text-right">
                <span className="text-xs font-bold text-hc-600">{fmt(avgPctHC, 1)}%</span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="text-xs font-bold text-hp-600">{fmt(avgPctHP, 1)}%</span>
              </td>
              <td className="px-4 py-3.5 text-right text-slate-400 font-mono">—</td>
              {showVarPct && (
                <td className="px-5 py-3.5 text-right text-slate-400 font-mono">—</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
