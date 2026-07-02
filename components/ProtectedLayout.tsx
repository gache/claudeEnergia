"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #0f1f45 0%, #0a1628 60%, #080f2a 100%)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
