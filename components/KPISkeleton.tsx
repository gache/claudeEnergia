"use client";

export default function KPISkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-card-md p-5 border border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
          </div>
          <div className="h-7 bg-slate-200 rounded w-20 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
      ))}
    </div>
  );
}
