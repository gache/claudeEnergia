import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as WebhookPayload;

    console.log("🔔 Webhook recibido desde Home Assistant:", {
      entity: payload.entity_id,
      valor: payload.new_state.state,
      timestamp: new Date().toISOString(),
    });

    // Aquí puedes procesar los datos
    // Por ahora solo registramos
    return NextResponse.json({
      success: true,
      message: "Webhook recibido correctamente",
      received: {
        entity: payload.entity_id,
        value: payload.new_state.state,
      },
    });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 400 }
    );
  }
}
