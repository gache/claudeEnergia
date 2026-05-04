"use client";

import { useHASync } from "@/lib/useHASync";
import { CheckCircle2, AlertCircle, RefreshCw, Clock } from "lucide-react";

export function HASyncStatus() {
  const { status, error, lastSync, syncNow } = useHASync(5);

  const statusConfig = {
    idle: {
      icon: Clock,
      color: "text-slate-500",
      bg: "bg-slate-50",
    },
    syncing: {
      icon: RefreshCw,
      color: "text-blue-600 animate-spin",
      bg: "bg-blue-50",
    },
    success: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} rounded-lg p-3 flex items-center gap-2`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">
          {status === "syncing" && "Sincronizando..."}
          {status === "success" && "Sincronizado"}
          {status === "error" && "Error de sincronización"}
          {status === "idle" && "Listo para sincronizar"}
        </p>
        {lastSync && (
          <p className="text-xs text-slate-600">
            Última sincronización: {lastSync.toLocaleTimeString("es-ES")}
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <button
        onClick={syncNow}
        disabled={status === "syncing"}
        className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded transition-colors"
      >
        Sincronizar
      </button>
    </div>
  );
}
