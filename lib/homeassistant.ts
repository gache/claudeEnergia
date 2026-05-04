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

async function getMonthlyConsumption(
  entityId: string
): Promise<number | null> {
  if (!TOKEN) {
    throw new Error("HA_TOKEN no configurado");
  }

  try {
    // Obtén el primer día del mes actual a las 00:00
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const startTime = firstDayOfMonth.toISOString();

    // Consulta historial desde el inicio del mes
    const historyUrl = `${BASE_URL}/api/history/period/${startTime}?filter_entity_ids=${entityId}`;

    const response = await fetch(historyUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Error fetching history for ${entityId}:`, response.status);
      return null;
    }

    const history = (await response.json()) as Array<
      Array<{ state: string; last_changed: string }>
    >;

    if (!history || history.length === 0 || history[0].length === 0) {
      console.warn(`No history found for ${entityId}`);
      return null;
    }

    // Obtén el valor del primer día del mes
    const firstValue = parseFloat(history[0][0].state);

    // Obtén el valor actual
    const currentState = await fetchHAState(entityId);
    if (!currentState) {
      return null;
    }

    const currentValue = parseFloat(currentState.state);

    if (isNaN(firstValue) || isNaN(currentValue)) {
      console.warn(`Invalid values in history for ${entityId}:`, {
        first: history[0][0].state,
        current: currentState.state,
      });
      return null;
    }

    // Calcula el consumo del mes (diferencia)
    const monthlyConsumption = currentValue - firstValue;

    console.log(
      `📊 ${entityId}: acumulado=${currentValue}, inicial=${firstValue}, consumo_mes=${monthlyConsumption.toFixed(
        3
      )} kWh`
    );

    return monthlyConsumption;
  } catch (error) {
    console.error(`Error calculating monthly consumption for ${entityId}:`, error);
    return null;
  }
}

export async function getEnergyData(): Promise<SensorData | null> {
  try {
    const [hc, hp] = await Promise.all([
      getMonthlyConsumption(SENSOR_HC),
      getMonthlyConsumption(SENSOR_HP),
    ]);

    if (hc === null || hp === null) {
      console.warn("No se pudieron obtener datos de consumo mensual");
      return null;
    }

    return {
      hc,
      hp,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting energy data:", error);
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
