"use client";
import { useEnergy } from "@/lib/EnergyContext";
import { ANOS_DISPONIBLES, MESES } from "@/lib/data";

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function cellBg(t: number): string {
  if (t <= 0) return "#f8fafc";
  if (t >= 1) return "#dc2626";
  if (t <= 0.5) {
    const s = t * 2;
    return `rgb(${lerp(248, 251, s)},${lerp(250, 191, s)},${lerp(252, 36, s)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${lerp(251, 220, s)},${lerp(191, 38, s)},${lerp(36, 38, s)})`;
}

export default function HeatmapCosto() {
  const { getByYear } = useEnergy();

  const years = ANOS_DISPONIBLES.filter(y => getByYear(y).length > 0);
  if (years.length === 0) return null;

  type Cell = { costo: number | null; kwh: number | null };
  const grid: Record<number, Record<number, Cell>> = {};
  let minC = Infinity, maxC = -Infinity;

  years.forEach(y => {
    grid[y] = {};
    for (let m = 1; m <= 12; m++) grid[y][m] = { costo: null, kwh: null };
    getByYear(y).forEach(k => {
      grid[y][k.mes] = { costo: k.costoTotal, kwh: k.total };
      if (k.costoTotal < minC) minC = k.costoTotal;
      if (k.costoTotal > maxC) maxC = k.costoTotal;
    });
  });

  const range = maxC - minC || 1;
  const norm = (v: number) => (v - minC) / range;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
            Mapa de calor · coste mensual
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Intensidad por coste · claro = bajo · rojo = alto</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-slate-400">Bajo</span>
          <div className="w-20 h-2.5 rounded-full" style={{
            background: `linear-gradient(to right, ${cellBg(0)}, ${cellBg(0.25)}, ${cellBg(0.5)}, ${cellBg(0.75)}, ${cellBg(1)})`
          }} />
          <span className="text-[10px] text-slate-400">Alto</span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[480px] px-1">

          {/* Month header */}
          <div className="grid mb-1.5" style={{ gridTemplateColumns: "52px repeat(12, 1fr)", gap: "3px" }}>
            <div />
            {MESES.map(m => (
              <div key={m} className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                {m.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Year rows */}
          {years.map((y, yi) => (
            <div key={y} className="grid mb-1" style={{ gridTemplateColumns: "52px repeat(12, 1fr)", gap: "3px" }}>
              <div className="flex items-center pr-2">
                <span className="text-xs font-bold text-slate-500 tabular-nums">{y}</span>
              </div>
              {Array.from({ length: 12 }, (_, mi) => {
                const mes  = mi + 1;
                const cell = grid[y][mes];
                const idx  = yi * 12 + mi;

                if (!cell.costo) {
                  return (
                    <div
                      key={mes}
                      className="rounded-lg animate-fade-in"
                      style={{
                        height: 40,
                        backgroundColor: "#f8fafc",
                        border: "1px dashed #e2e8f0",
                        animationDelay: `${idx * 20}ms`,
                        animationFillMode: "both",
                      }}
                    />
                  );
                }

                const t       = norm(cell.costo);
                const bg      = cellBg(t);
                const isLight = t < 0.42;

                return (
                  <div
                    key={mes}
                    className="rounded-lg flex flex-col items-center justify-center cursor-default animate-fade-in"
                    style={{
                      height: 40,
                      backgroundColor: bg,
                      animationDelay: `${idx * 20}ms`,
                      animationFillMode: "both",
                    }}
                    title={`${MESES[mi]} ${y} · ${cell.costo.toFixed(2)} € · ${cell.kwh?.toFixed(1)} kWh`}
                  >
                    <span
                      className="text-[10px] font-bold tabular-nums leading-none"
                      style={{ color: isLight ? "#475569" : "#fff" }}
                    >
                      {cell.costo.toFixed(1)}
                    </span>
                    <span
                      className="text-[8px] leading-none mt-0.5"
                      style={{ color: isLight ? "#94a3b8" : "rgba(255,255,255,0.7)" }}
                    >
                      €
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Min / max labels */}
          <div className="flex items-center justify-between mt-3 px-0.5">
            <span className="text-[10px] text-slate-400 font-mono">{minC.toFixed(2)} € mín</span>
            <span className="text-[10px] text-slate-400 font-mono">{maxC.toFixed(2)} € máx</span>
          </div>

        </div>
      </div>
    </div>
  );
}
