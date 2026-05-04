"use client";

export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-card-md border border-slate-100 overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              {[...Array(7)].map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-slate-50">
                {[...Array(7)].map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-slate-100 rounded w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
