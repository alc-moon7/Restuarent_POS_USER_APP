# Restaurant POS Ordering

Production-ready Flutter customer ordering app for the Restaurant POS LAN system.
It connects to the Admin/Server Flutter app over the same WiFi network and does
not require internet when used locally. The same Flutter app also builds as a
responsive web app for Cloudflare Pages.

## Features

- Splash and server connection flow
- Saved Admin host/port/protocol with connection test
- Menu browsing with search, category filters, refresh, empty/error states
- Cart with quantity controls, table number, customer note, duplicate-submit guard
- Order placement through `POST /orders`
- Live order tracking over `ws://HOST:PORT/ws` or `wss://HOST:PORT/ws` with reconnect
- Responsive phone/tablet/desktop UI with a premium restaurant ordering theme
- Cloudflare Pages build script and static headers

## Admin API Used

- `GET /health`
- `GET /menu`
- `POST /orders`
- `GET /orders`
- `WS /ws`

## Run

```bash
flutter pub get
flutter run
```

Run as a local website:

```bash
flutter run -d chrome
```

Build a debug APK:

```bash
flutter build apk --debug
```

Build the production web bundle:

```bash
flutter build web --release
```

## Cloudflare Pages

Use these settings when connecting the Git repository to Cloudflare Pages:

- Framework preset: `None`
- Build command: `bash ./cloudflare_build.sh`
- Build output directory: `build/web`
- Root directory: `/`

Optional environment variables:

- `FLUTTER_VERSION=stable`
- `FLUTTER_BASE_HREF=/`

Cloudflare Pages is served over HTTPS. If the hosted website needs to connect to
the Admin server, the Admin API should be available over HTTPS/WSS, for example
through a secure domain or Cloudflare Tunnel. The Admin API must also allow CORS
from your Pages domain. Plain `http://` and `ws://` LAN servers are best for
local browser/device testing.

## Customer Device Flow

1. Start the Admin server from the Admin app.
2. Put the customer device on the same WiFi network.
3. Enter the Admin host and port, for example `192.168.0.105` and `8080`.
   Use HTTPS/WSS only when the Admin server supports it.
4. Tap **Test Connection**, then **Continue**.
5. Browse menu, add items, enter table number, and place the order.

Example URLs:

```js
fetch("http://ADMIN_LOCAL_IP:8080/menu")

fetch("http://ADMIN_LOCAL_IP:8080/orders", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify(orderPayload)
})

const ws = new WebSocket("ws://ADMIN_LOCAL_IP:8080/ws")
```

Secure web example:

```js
fetch("https://api.example.com:443/menu")

const ws = new WebSocket("wss://api.example.com:443/ws")
```
