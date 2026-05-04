"use client";

export default function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 p-6 animate-pulse">
      <div className="mb-6">
        <div className="h-5 bg-slate-200 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-64" />
      </div>

      <div className="flex items-end gap-3 justify-center h-64">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t"
            style={{ height: `${40 + (i % 3) * 30}%` }} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <div className="h-3 bg-slate-200 rounded w-24" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <div className="h-3 bg-slate-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
