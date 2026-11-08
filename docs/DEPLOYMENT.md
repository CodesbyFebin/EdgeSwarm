# Deploy the app separately from the landing page

Keep `index.html` and GitHub Pages unchanged. Deploy this repository's root Next.js application to Vercel. Pages is a static landing page, not the Jobs API.

## Vercel

1. Import `CodesbyFebin/EdgeSwarm` into your Vercel account, with root directory `.` and framework Next.js. Use Node.js 22 and the lockfile (`npm ci`).
2. Connect a dedicated Neon PostgreSQL database from the Vercel Marketplace. This run created `edgeswarm-postgres` on the Free plan, with Auth and Realtime disabled. Review its limits before increasing usage.
3. Provide the server-only `DATABASE_URL` environment variable (`POSTGRES_URL` is also supported). Never prefix them with `NEXT_PUBLIC_`, paste them into chat, or commit them.
4. Deploy. `/api/health` returns 503 on Vercel if storage configuration is missing. It checks configuration, not PostgreSQL connectivity.
5. Run `BASE_URL=https://YOUR-DEPLOYMENT node scripts/smoke.mjs`. If Deployment Protection is enabled, use an approved test path or perform the flows in the authenticated browser. Do not publicly disclose a bypass secret.
6. Manually test `/`, `/mobile`, and `/devnet-demo`. A wallet test requires explicit approval and Devnet-only test SOL. No on-chain test was performed in this audit.
7. Only after the live job/tamper flows pass, add the actual app URL to the Pages landing page. No live URL is asserted in this repository yet.

The app fails closed on Vercel without shared storage. It never falls back to filesystem or process memory there. PostgreSQL uses expiring per-session records and revision-checked atomic updates, with retry on conflicts. Tables initialize lazily on first use. Worker/verifier private keys are stored server-side in those records to preserve demo signing identity across instances; protect the database as secret material.

## Local / single-instance Node

Node.js 22 recommended:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start -- --hostname 127.0.0.1 --port 3100
# separate terminal
node scripts/smoke.mjs
```

Without PostgreSQL environment variables, state is disposable process memory. Restarting the server clears jobs and keys. Do not use that fallback with multiple replicas.

A Dockerfile is supplied but was not built during this audit. It is not deployment evidence.

## Operational boundaries

Session cookies isolate anonymous browser demos; they are not user authentication. Jobs and receipts are temporary, and a cleared cookie loses access. Request limits are per session, not per person or IP. Use Vercel's abuse controls and spending limits; cookie rotation can bypass per-session limits. Do not connect real funds, private workloads, or production secrets.
