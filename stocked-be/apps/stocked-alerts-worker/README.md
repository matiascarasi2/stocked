# @stocked/alerts-worker

Background service for price alerts: Finnhub [WebSocket trades](https://finnhub.io/docs/api/websocket-trades), crossing detection, and Firebase Cloud Messaging push.

## Setup

```sh
# From stocked-be root
cp apps/stocked-alerts-worker/.env.example apps/stocked-alerts-worker/.env
# Set FINNHUB_API_KEY and ALERTS_WORKER_INTERNAL_SECRET (must match gateway)
```

`DATABASE_URL` is read from [`packages/stocked-schema/.env`](../../packages/stocked-schema/.env) in local dev. In production, set `DATABASE_URL` on the worker service (same Postgres as the gateway).

## Run

```sh
pnpm dev:worker
# or both gateway + worker:
pnpm dev:backend
```

```sh
curl http://localhost:3001/health
```

## Internal API

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/internal/symbols/sync` | Header `X-Internal-Secret` |
| `GET` | `/health` | None |

Body for sync: `{ "symbol": "AAPL" }`. The gateway calls this after alert create/delete/deactivate.

## Firebase (FCM) setup

1. Open [Firebase Console](https://console.firebase.google.com/) → same project as `stocked-app` (`com.stocked.app`).
2. **Project settings** → **Service accounts** → **Generate new private key**.
3. Save JSON as `apps/stocked-alerts-worker/firebase-service-account.json` (gitignored).
4. Set `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json` in worker `.env`.

Without the service account file, the worker still runs but logs instead of sending push.

### Test push

1. Sign in on an Android dev build so `Device.pushToken` is stored.
2. Run `pnpm dev:backend`.
3. Create an alert near the live price during market hours.
4. Or send a test message from Firebase Console → **Messaging** using the device token from Prisma Studio.

### Demo push (dev)

On-demand push for showcases — no worker, gateway, or live alert required.

1. Sign in on an Android dev build and copy the token from Metro (`[FCM] Token: …`).
2. Paste it into `scripts/send-dev-push.ts` as `FCM_TOKEN` (use the placeholder in git; do not commit a real token).
3. Ensure `firebase-service-account.json` exists and `FIREBASE_SERVICE_ACCOUNT_PATH` is set in `.env`.
4. From `stocked-be`: `pnpm --filter @stocked/alerts-worker dev:push`

Foreground app → in-app toast; background → system notification tray.

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Default `3001` |
| `FINNHUB_API_KEY` | Yes | WebSocket trades |
| `ALERTS_WORKER_INTERNAL_SECRET` | Yes | Must match gateway |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | No* | Path to Firebase Admin JSON |
| `ALERT_COOLDOWN_MINUTES` | No | Default `15` |
| `MAX_WEBSOCKET_SYMBOLS` | No | Default `50` (Finnhub free tier) |

\*Required for real push delivery.
