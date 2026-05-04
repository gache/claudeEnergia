# Configuración de Webhook con Home Assistant

Usa webhooks para sincronizar datos en **tiempo real** sin polling.

## 🔔 Cómo Funciona

```
Sensor cambia en Home Assistant
         ↓
Automatización se dispara
         ↓
Envía webhook a tu app
         ↓
/api/webhook/ha recibe datos
         ↓
Dashboard actualiza automáticamente
```

## 📋 Configuración en Home Assistant

### Opción 1: Via YAML (Recomendado)

En `configuration.yaml`, agrega:

```yaml
automation:
  - alias: "Sincronizar Energía a claudeEnergia"
    trigger:
      - platform: state
        entity_id: sensor.linky_easf01
      - platform: state
        entity_id: sensor.linky_easf02
    action:
      - service: rest_command.sync_energia
```

Luego agrega el `rest_command`:

```yaml
rest_command:
  sync_energia:
    url: "http://tu_app_url:3000/api/webhook/ha"
    method: POST
    payload: |
      {
        "entity_id": "{{ trigger.entity_id }}",
        "new_state": {
          "state": "{{ trigger.to_state.state }}",
          "attributes": {{ trigger.to_state.attributes | tojson }}
        },
        "old_state": {
          "state": "{{ trigger.from_state.state }}"
        }
      }
    headers:
      Content-Type: application/json
```

### Opción 2: Via UI

1. **Settings → Automations & Scenes**
2. **Create Automation**
3. Trigger: `State`
   - Entity: `sensor.linky_easf01`
4. Condition: (ninguno)
5. Action: `Call a service`
   - Service: `rest.get` o `rest.post`
   - (O usa un webhook action si tu versión lo soporta)

---

## 🧪 Prueba el Webhook

```bash
# Simula un cambio de sensor
curl -X POST http://localhost:3000/api/webhook/ha \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "sensor.linky_easf01",
    "new_state": {
      "state": "37235.680",
      "attributes": {"unit_of_measurement": "kWh"}
    }
  }'
```

---

## 📍 URL del Webhook en Producción

- **Local**: `http://localhost:3000/api/webhook/ha`
- **Vercel**: `https://tu-dominio.vercel.app/api/webhook/ha`

En Home Assistant, reemplaza `tu_app_url` con la URL correcta.

---

## 🔒 Seguridad (Opcional)

Para proteger el webhook, agrega validación de token:

```yaml
rest_command:
  sync_energia:
    url: "https://tu_dominio.vercel.app/api/webhook/ha"
    method: POST
    headers:
      Authorization: "Bearer {{ states('input_text.webhook_secret') }}"
    payload: ...
```

---

## ✅ Ventajas

- ✅ Sincronización en tiempo real
- ✅ Actualización automática sin polling
- ✅ Menor carga en Home Assistant
- ✅ Dashboard siempre actualizado

## ⚙️ Próximos Pasos

1. Configura la automatización en Home Assistant
2. Prueba con curl
3. Mira los logs en `npm run dev`
4. Integra con `useHASync` para guardar en EnergyContext
