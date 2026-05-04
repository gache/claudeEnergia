type HAState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

type SensorData = {
  hc: number;
  hp: number;
  timestamp: string;
};

const BASE_URL = process.env.HA_BASE_URL || "http://homeassistant.local:8123";
const TOKEN = process.env.HA_TOKEN;
const SENSOR_HC = process.env.HA_SENSOR_HC || "sensor.energia_hc";
const SENSOR_HP = process.env.HA_SENSOR_HP || "sensor.energia_hp";

if (!TOKEN) {
  console.warn("⚠️  HA_TOKEN no está configurado en .env.local");
}

async function fetchHAState(entityId: string): Promise<HAState | null> {
  if (!TOKEN) {
    throw new Error("HA_TOKEN no configurado");
  }

  try {
    const response = await fetch(`${BASE_URL}/api/states/${entityId}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching ${entityId}:`,
        response.status,
        response.statusText
      );
      return null;
    }

    return (await response.json()) as HAState;
  } catch (error) {
    console.error(`Error connecting to Home Assistant:`, error);
    return null;
  }
}

export async function getEnergyData(): Promise<SensorData | null> {
  const [hcState, hpState] = await Promise.all([
    fetchHAState(SENSOR_HC),
    fetchHAState(SENSOR_HP),
  ]);

  if (!hcState || !hpState) {
    console.warn("No se pudieron obtener datos de sensores");
    return null;
  }

  try {
    const hc = parseFloat(hcState.state);
    const hp = parseFloat(hpState.state);

    if (isNaN(hc) || isNaN(hp)) {
      console.warn("Valores inválidos en sensores:", {
        hc: hcState.state,
        hp: hpState.state,
      });
      return null;
    }

    return {
      hc,
      hp,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error parsing sensor data:", error);
    return null;
  }
}

export async function testConnection(): Promise<boolean> {
  if (!TOKEN) {
    console.error("HA_TOKEN no configurado");
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error testing HA connection:", error);
    return false;
  }
}
