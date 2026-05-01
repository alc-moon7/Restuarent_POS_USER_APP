# Local POS Menu

Production-ready Flutter customer ordering app for the Restaurant POS LAN system.
It connects to the Admin/Server Flutter app over the same WiFi network and does
not require internet.

## Features

- Splash and server connection flow
- Saved Admin IP/port with connection test
- Menu browsing with search, category filters, refresh, empty/error states
- Cart with quantity controls, table number, customer note, duplicate-submit guard
- Order placement through `POST /orders`
- Live order tracking over `ws://IP:PORT/ws` with reconnect
- Responsive phone/tablet UI with a premium restaurant ordering theme

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

Build a debug APK:

```bash
flutter build apk --debug
```

## Customer Device Flow

1. Start the Admin server from the Admin app.
2. Put the customer device on the same WiFi network.
3. Enter the Admin local IP and port, for example `192.168.0.105` and `8080`.
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
