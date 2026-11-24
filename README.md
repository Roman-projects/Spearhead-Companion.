# Spearhead Companion

Mobile-first web application for Warhammer Age of Sigmar: Spearhead.

## Stack

- React
- TypeScript
- Vite
- Capacitor (mobile packaging foundation)

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run build
```

## Architecture principles

- Keep game rules, domain state, and calculations independent from presentation.
- Keep the visual implementation faithful to the approved UI reference.
- Do not infer or invent game rules from presentation requirements.
- Mobile-first layout; desktop support follows without changing domain behavior.

## Current status

Initial application scaffold. The visible shell is temporary and is not the approved final visual design.

## Database

The application uses PostgreSQL on Neon. Server-side Vercel Functions access it through
`DATABASE_URL` and the shared pool in `api/_lib/db.ts`. Never import this module from
browser code or expose the connection string through a `VITE_*` variable.

### Schema migrations

The initial schema is stored in `database/migrations/0001_initial_schema.sql`.
Migrations are intentionally separate from deployment: Vercel builds do not modify the
database.

With `DATABASE_URL` set in a trusted local environment:

- `npm run db:migrate` performs a read-only check and reports whether the initial
  migration is pending or already applied.
- To apply it deliberately, set `ALLOW_SCHEMA_MIGRATIONS=true` and run
  `npm run db:migrate -- --apply`.

The runner uses a transaction, a PostgreSQL advisory lock, and a checksum ledger
(`public.schema_migrations`). It refuses to apply migrations from inside a Vercel
deployment. Review the target database and migration SQL before using `--apply`.
