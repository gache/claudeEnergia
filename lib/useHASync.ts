import { useEffect, useState } from "react";
import { useEnergy } from "@/lib/EnergyContext";

type SyncStatus = "idle" | "syncing" | "success" | "error";

type UseSyncReturn = {
  status: SyncStatus;
  error: string | null;
  lastSync: Date | null;
  syncNow: () => Promise<void>;
};

export function useHASync(intervalMinutes: number = 5): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { addOrUpdate } = useEnergy();

  const sync = async () => {
    setStatus("syncing");
    setError(null);

    try {
      const response = await fetch("/api/ha-sync");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Guarda los datos en EnergyContext como registro del mes actual
        const now = new Date();
        const mes = now.getMonth() + 1;
        const año = now.getFullYear();

        addOrUpdate({
          mes,
          año,
          hc: data.data.hc,
          hp: data.data.hp,
        });

        setStatus("success");
        setLastSync(new Date());
        console.log("✅ Datos sincronizados desde Home Assistant", data.data);
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("❌ Error en sincronización:", err);
    }
  };

  useEffect(() => {
    // Sincroniza inmediatamente al montar
    sync();

    // Sincroniza periódicamente
    const interval = setInterval(sync, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [intervalMinutes]);

  return {
    status,
    error,
    lastSync,
    syncNow: sync,
  };
}
