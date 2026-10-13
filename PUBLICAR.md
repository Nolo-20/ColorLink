# Publicar ColorLink en internet (gratis, sin abrir puertos)

La tienda y el ERP se publican con **Tailscale Funnel**: Tailscale les da una dirección pública con HTTPS
y lleva el tráfico hasta tu servidor por un túnel de salida. No se toca el módem ni se paga nada.

| App    | Dirección                                   |
|--------|---------------------------------------------|
| Tienda | `https://colorlink-web.<tu-tailnet>.ts.net` |
| ERP    | `https://colorlink-erp.<tu-tailnet>.ts.net` |

`<tu-tailnet>` es el nombre de tu red de Tailscale (ej. `tail1a2b3c`). Lo ves en
https://login.tailscale.com/admin/dns → "Tailnet name".

## 1. Activar HTTPS y Funnel en Tailscale (una sola vez)

1. https://login.tailscale.com/admin/dns → **HTTPS Certificates** → *Enable HTTPS*.
2. https://login.tailscale.com/admin/acls → en el archivo de políticas, deja (o agrega) este bloque y guarda:

   ```json
   "nodeAttrs": [
     { "target": ["autogroup:member"], "attr": ["funnel"] }
   ]
   ```

   (Si ya existe `nodeAttrs`, solo agrega ese objeto a la lista.)
3. Opcional, para una dirección más bonita: en https://login.tailscale.com/admin/dns → *Rename tailnet*
   puedes elegir uno de los nombres que Tailscale sugiere (ej. `colorlink-fox.ts.net`).

## 2. Configurar las direcciones en `~/ColorLink/.env`

```env
APP_URL=https://colorlink-web.<tu-tailnet>.ts.net
ERP_URL=https://colorlink-erp.<tu-tailnet>.ts.net
```

`APP_URL` se usa en los botones de los correos, el enlace para restablecer contraseña y el ingreso con Google.

## 3. Ingreso con Google

En https://console.cloud.google.com/apis/credentials → tu cliente OAuth → **URI de redireccionamiento autorizados**,
agrega:

```
https://colorlink-web.<tu-tailnet>.ts.net/auth/callback
```

(y en *Orígenes de JavaScript autorizados*: `https://colorlink-web.<tu-tailnet>.ts.net`).
Si la app de Google está en modo **Prueba**, agrega los correos de las personas que van a ver la demo
en *Pantalla de consentimiento → Usuarios de prueba*; o usen ingreso por código al correo.

## 4. Levantar

```bash
cd ~/ColorLink-ERP && git pull origin integracion-api
cd ~/ColorLink && git pull origin erp-integracion
docker compose up -d --build
docker exec colorlink-tailscale tailscale funnel status
docker exec colorlink-erp-tailscale tailscale funnel status
```

Cada `funnel status` debe mostrar `(Funnel on)` con la dirección `https://…ts.net`.

## 5. Probar como lo verán los invitados

Abre la dirección desde el celular **con el Wi-Fi apagado** (datos móviles). Si carga, ya es pública.
La primera vez puede tardar 1–2 minutos mientras Tailscale emite el certificado.

## Notas

- El servidor debe estar encendido durante la presentación; si se apaga, la página no carga.
- Funnel es para demos y uso ligero (tiene límite de ancho de banda); para un grupo pequeño va de sobra.
- Para volver a dejarlo privado (solo tu tailnet): quita la línea `AllowFunnel` de
  `tailscale/web-serve.json` y/o `tailscale/erp-serve.json` y ejecuta `docker compose up -d`.
- Si al arrancar `funnel status` dice que Funnel no está permitido, revisa el paso 1.2.
