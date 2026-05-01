# Hybrid POS Customer Web

React/Vite customer ordering web app for the Hybrid Restaurant POS system.

## Modes

Local offline mode:

```txt
Admin Flutter APK -> http://ADMIN_LOCAL_IP:8080/customer
Customer browser -> same-origin GET /menu, POST /orders, WS /ws
```

Online cloud mode:

```txt
https://menu.yourdomain.com/r/:restaurantId/o/:outletId
VITE_CLOUD_API_URL=https://api.example.com
```

Browsers cannot reliably listen to LAN UDP broadcasts, so this app does not use
UDP discovery. Local users scan the Admin app QR and open `/customer`.

## Environment

```sh
cp .env.example .env
```

```txt
VITE_CLOUD_API_URL=https://api.example.com
VITE_DEFAULT_RESTAURANT_ID=rest_001
VITE_DEFAULT_OUTLET_ID=outlet_001
VITE_APP_NAME=Local POS Menu
```

## Run

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Output directory:

```txt
dist
```

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_CLOUD_API_URL=https://your-api-domain.com`

## Routes

- `/` smart connection resolver
- `/customer` local offline mode
- `/r/:restaurantId/o/:outletId` online cloud menu
- `/cart`
- `/order/:orderId`
- `/settings`

## Admin Local Server

The Admin Flutter app should bundle the production `dist` output and serve:

- `GET /customer`
- `GET /assets/*`
- fallback customer routes such as `/cart`, `/order/:id`, `/settings`
- existing API endpoints: `/health`, `/menu`, `/orders`, `/ws`

Offline QR example:

```txt
http://192.168.0.105:8080/customer
```

Online URL example:

```txt
https://menu.yourdomain.com/r/rest_001/o/outlet_001
```

## Browser Limitation

If a hosted HTTPS page tries to call a local `http://192.168.x.x:8080` API,
the browser may block mixed content. For offline ordering, users should connect
to restaurant WiFi and scan the local Admin QR again.
