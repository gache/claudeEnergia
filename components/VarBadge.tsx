export default function VarBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-300 text-xs">—</span>;
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
      up ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
    }`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span> {Math.abs(pct).toFixed(1)}%
    </span>
  );
}
