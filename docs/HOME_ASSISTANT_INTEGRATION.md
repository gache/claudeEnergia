# Integración Home Assistant

Esta estructura permite sincronizar datos de consumo eléctrico desde Home Assistant.

## 🔧 Configuración

### 1. Obtener Token de Home Assistant

1. En Home Assistant: Avatar → **Long-Lived Access Tokens**
2. Crear nuevo token (nombre: `claudeEnergia-api`)
3. Copiar el token

### 2. Configurar Variables de Entorno

En `.env.local`:

```
HA_BASE_URL=http://homeassistant.local:8123
HA_TOKEN=your_long_lived_token_here
HA_SENSOR_HC=sensor.energia_hc
HA_SENSOR_HP=sensor.energia_hp
HA_SYNC_SECRET=optional_secret_for_webhooks
```

**Cambiar según tus sensores en Home Assistant**.

Ejemplo si tus sensores son `sensor.medidor_horas_frias` y `sensor.medidor_horas_punta`:

```
HA_SENSOR_HC=sensor.medidor_horas_frias
HA_SENSOR_HP=sensor.medidor_horas_punta
```

## 📁 Estructura

```
lib/
├── homeassistant.ts       # Cliente de HA API
└── useHASync.ts           # Hook para sincronizar

app/api/
└── ha-sync/
    └── route.ts           # Endpoint POST/GET para sincronizar

components/
└── HASyncStatus.tsx       # UI para mostrar estado de sync
```

## 🚀 Uso

### En un Componente

```typescript
import { useHASync } from "@/lib/useHASync";

export function MyComponent() {
  const { status, lastSync, syncNow, error } = useHASync(5); // Sincroniza cada 5 min

  return (
    <div>
      <p>Estado: {status}</p>
      <p>Última sync: {lastSync?.toLocaleTimeString()}</p>
      {error && <p className="text-red-600">{error}</p>}
      <button onClick={syncNow}>Sincronizar ahora</button>
    </div>
  );
}
```

### Mostrar Widget de Sincronización

```typescript
import { HASyncStatus } from "@/components/HASyncStatus";

export default function Dashboard() {
  return (
    <div>
      <HASyncStatus /> {/* Sincroniza cada 60 minutos */}
      {/* resto del contenido */}
    </div>
  );
}
```

## 🔄 Flujo de Datos

```
Home Assistant (sensores)
       ↓ (API REST)
/api/ha-sync (Next.js)
       ↓
Firestore (actualiza lastHAData)
       ↓
EnergyContext (lee desde Firestore)
       ↓
UI (muestra datos)
```

## 🧪 Probar la Conexión

```bash
# Test de conexión a Home Assistant
curl -H "Authorization: Bearer $HA_TOKEN" \
  http://homeassistant.local:8123/api/

# Leer estado de un sensor
curl -H "Authorization: Bearer $HA_TOKEN" \
  http://homeassistant.local:8123/api/states/sensor.energia_hc
```

O desde Node:

```javascript
import { testConnection, getEnergyData } from "@/lib/homeassistant";

const isConnected = await testConnection();
const data = await getEnergyData();
```

## ⚙️ Opciones de Sincronización

### Automática (cada 5 minutos)

```typescript
const { syncNow } = useHASync(5);
```

### Manual

```typescript
const { syncNow } = useHASync(999999); // Intervalo muy largo
// ... y luego:
await syncNow(); // Manual cuando quieras
```

### Webhook desde Home Assistant

Si quieres que HA inicie la sincronización automáticamente:

1. En Home Assistant, crea una automatización:

```yaml
automation:
  - alias: Sync Energy to claudeEnergia
    trigger:
      - platform: state
        entity_id: sensor.energia_hc
    action:
      - service: rest_command.sync_energia
```

2. En `configuration.yaml`:

```yaml
rest_command:
  sync_energia:
    url: http://tuip:3000/api/ha-sync
    method: POST
    headers:
      Authorization: "Bearer {{ state_attr('input_text.claude_energia_token', 'value') }}"
```

## 🐛 Debugging

- **401 Unauthorized**: Token expirado o incorrecto. Genera uno nuevo.
- **No se conecta**: Verifica `HA_BASE_URL` y que HA esté accesible.
- **Sensores no encontrados**: Revisa los nombres exactos en `Developer Tools → States`.
- **Firebase no actualiza**: Verifica que el path `familias/hogar/data/profile` exista.

## 📝 Notas

- La sincronización es **no-bloqueante**: no detiene la app si HA no responde
- Los datos se guardan en `lastHAData` en Firestore para auditoría
- El intervalo por defecto es 5 minutos (configurable)
