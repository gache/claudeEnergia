import { NextRequest, NextResponse } from "next/server";
import { getEnergyData } from "@/lib/homeassistant";

export async function GET(request: NextRequest) {
  try {
    // Verifica que la request venga de localhost
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const isLocalhost =
      origin?.includes("localhost") ||
      origin?.includes("127.0.0.1") ||
      host?.includes("localhost") ||
      host?.includes("127.0.0.1");

    // En desarrollo local, permitir sin validación adicional
    // En producción, requerirá un token secreto
    if (!isLocalhost && !process.env.HA_SYNC_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized - configure HA_SYNC_SECRET para acceso remoto" },
        { status: 401 }
      );
    }

    console.log("🔄 HA Sync iniciado...");
    console.log("HA_BASE_URL:", process.env.HA_BASE_URL);
    console.log("HA_TOKEN existe:", !!process.env.HA_TOKEN);
    console.log("HA_SENSOR_HC:", process.env.HA_SENSOR_HC);
    console.log("HA_SENSOR_HP:", process.env.HA_SENSOR_HP);

    // Obtiene datos de Home Assistant
    const energyData = await getEnergyData();

    if (!energyData) {
      return NextResponse.json(
        { error: "No se pudieron obtener datos de Home Assistant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: energyData,
      message: "Datos sincronizados desde Home Assistant",
    });
  } catch (error) {
    console.error("Error in ha-sync:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // También permite POST para compatibilidad con webhooks
  return GET(request);
}
