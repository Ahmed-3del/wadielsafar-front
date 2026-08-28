# Wadi Al Safar — Website

Customer-facing Next.js site for Wadi Al Safar, a Saudi travel & tourism company. Phase 1: architecture and representative examples (flights, hotels, packages, visas, cruises, offers, corporate, inquiries), not full content.

## Prerequisites

- Node.js 20.9+ (Next.js 16 requirement)
- npm (this project does not use pnpm/yarn)
- The sibling Django REST backend running at `http://localhost:8000/api/v1` for live data. The site still builds, lints, and renders without it — data sections degrade to an empty state and the inquiry form will surface an error on submit.

## Environment setup

Copy the example env file and adjust if needed:

```bash
cp .env.example .env.local
```

Variables:

- `NEXT_PUBLIC_API_URL` — backend API base URL (default `http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_SITE_URL` — this site's own URL, used for metadata/sitemap/robots (default `http://localhost:3000`)
- `NEXT_PUBLIC_DEFAULT_LOCALE` — default locale (`ar`)

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:3000
npm run build     # production build (Turbopack, type-checked)
npm run start     # run the production build
npm run lint      # ESLint
npm run test      # run the Vitest suite once
npm run test:watch # Vitest in watch mode
npm run format    # Prettier --write
npm run format:check
```

## Structure

See `src/app/[locale]` for routes (locale-prefixed: `/ar`, `/en`), `src/components` for UI grouped by domain, `src/lib/api` for the typed backend client, `src/features` for reserved future client-side feature folders, and `messages/{ar,en}.json` for translations. Locale routing is handled by `src/proxy.ts` (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`).
# wadielsafar-front
