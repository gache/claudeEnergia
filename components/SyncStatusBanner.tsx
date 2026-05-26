"use client";

import { WifiOff } from "lucide-react";
import { useEnergy } from "@/lib/EnergyContext";

export default function SyncStatusBanner() {
  const { syncStatus } = useEnergy();
  if (syncStatus !== "error") return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <WifiOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-700 font-medium">
        Sin conexión a la nube — los cambios se guardan localmente y se sincronizarán al reconectar
      </p>
    </div>
  );
}
