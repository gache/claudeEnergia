import { useEffect, useState } from "react";

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

  const sync = async () => {
    setStatus("syncing");
    setError(null);

    try {
      const response = await fetch("/api/ha-sync");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setLastSync(new Date());
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
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
