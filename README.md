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
