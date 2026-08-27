# Stage 2 — Cloudflare → Hyperdrive → Neon

Status: PREPARED, NOT YET DEPLOYED.

## Locked architecture

Existing kennel dashboard → Cloudflare Worker API → Hyperdrive binding `HYPERDRIVE` → Neon PostgreSQL.

The application runtime must use the dedicated Neon role `kennel_runtime`; the Neon owner credential must never be placed in Worker source, GitHub, or browser JavaScript.

## Current API surface

- `GET /api/health`
- `GET /api/dashboard`
- `GET|POST /api/animals`
- `PATCH|DELETE /api/animals/:id`
- `GET /api/kennels`
- `GET /api/tasks`
- `GET /api/incidents`
- `GET /api/audit`

Data routes are intentionally not ready for public exposure. Authentication and server-side role/centre authorization are the next gate. Until then, deployment must be isolated/private and use synthetic data only.

## Deployment gate

1. Cloudflare account connection available.
2. Create Hyperdrive configuration using the Neon `kennel_runtime` credential.
3. Add Hyperdrive binding named `HYPERDRIVE` to `genevieve-kennels-api`.
4. Run Worker dry-run/build check.
5. Deploy isolated HTTPS preview.
6. Verify `/api/health` reports database role `kennel_runtime`.
7. Use synthetic facility/animal records to verify read/write/audit behavior.
8. Clean synthetic records.
9. Do not merge to `main` until authentication/authorization gate is completed or the Worker remains inaccessible to the public.

## Front-end migration rule

Do not redesign the existing kennel dashboard. Replace browser `localStorage` persistence incrementally with calls to this API, preserving existing matching/play-risk logic until its server-side migration is separately verified.
