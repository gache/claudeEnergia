import { NextRequest, NextResponse } from "next/server";
import { getEnergyData } from "@/lib/homeassistant";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function GET(request: NextRequest) {
  try {
    // Verifica que la request venga de localhost o de un token secreto
    const origin = request.headers.get("origin");
    const authHeader = request.headers.get("authorization");

    if (
      !origin?.includes("localhost") &&
      authHeader !== `Bearer ${process.env.HA_SYNC_SECRET}`
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obtiene datos de Home Assistant
    const energyData = await getEnergyData();

    if (!energyData) {
      return NextResponse.json(
        { error: "No se pudieron obtener datos de Home Assistant" },
        { status: 500 }
      );
    }

    // Actualiza Firestore
    try {
      const profileRef = doc(db, "familias/hogar/data/profile");
      await updateDoc(profileRef, {
        lastHASyncAt: serverTimestamp(),
        lastHAData: {
          hc: energyData.hc,
          hp: energyData.hp,
          syncedAt: new Date().toISOString(),
        },
      });
    } catch (firestoreError) {
      console.error("Error updating Firestore:", firestoreError);
      // No falles si Firestore no está disponible
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
