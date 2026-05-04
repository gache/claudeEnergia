import { NextRequest, NextResponse } from "next/server";
import { getEnergyData } from "@/lib/homeassistant";

type WebhookPayload = {
  entity_id: string;
  new_state: {
    state: string;
    attributes: Record<string, unknown>;
  };
  old_state?: {
    state: string;
  };
};

let lastSyncTime = 0;
const SYNC_DEBOUNCE_MS = 5000; // Evita sincronizaciones muy frecuentes

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as WebhookPayload;

    console.log("🔔 Webhook recibido desde Home Assistant:", {
      entity: payload.entity_id,
      valor: payload.new_state.state,
      timestamp: new Date().toISOString(),
    });

    // Debounce: evita sincronizar si fue muy recientemente
    const now = Date.now();
    if (now - lastSyncTime < SYNC_DEBOUNCE_MS) {
      console.log("⏳ Sincronización en espera (debounce)...");
      return NextResponse.json({
        success: true,
        message: "Webhook recibido, sincronización en espera",
      });
    }

    lastSyncTime = now;

    // Obtén los datos actualizados con historial
    const energyData = await getEnergyData();

    if (!energyData) {
      return NextResponse.json(
        { error: "No se pudieron obtener datos" },
        { status: 500 }
      );
    }

    console.log("✅ Datos sincronizados vía webhook:", {
      hc: energyData.hc.toFixed(3),
      hp: energyData.hp.toFixed(3),
      timestamp: energyData.timestamp,
    });

    // Notifica al frontend para que actualice
    return NextResponse.json({
      success: true,
      message: "Sincronización completada",
      data: energyData,
    });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}
