# Gabai UPMin

A campus navigation web app for UP Mindanao — map-based listings, admin management, and search powered by Supabase and Google Maps.

## Project Specification

Functional requirements summary:

- Core navigation and mapping via Google Maps markers and listings
- Real-time geolocation with turn-by-turn directions
- Listing details surfaced in a bottom sheet or sidebar
- Category filters for campus locations
- Listings sheet for text-based searching
- Anonymous guest reviews with average rating and recent review limits
- Admin login (UP email) and CRUD tools for listings
- Public landing page with persistent visit counter
- Mobile-first UI using UP Mindanao brand colors
- First-time visitor redirect to a specialized landing page
- Vercel deployment

## Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Auth + Postgres)
- Google Maps (`@googlemaps/js-api-loader`)
- Tailwind CSS, shadcn/UI primitives

## Quickstart

1. Clone the repo

```bash
git clone https://github.com/oreocapybara/gabai-upmin.git
cd gabai-upmin
npm install
```

2. Create a `.env.local` at the project root with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_MAP_ID=your-map-id
```

Where to find these values:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are in Supabase Project Settings > API.
- `NEXT_PUBLIC_MAPS_API_KEY` and `NEXT_PUBLIC_MAP_ID` are in your Google Cloud project (Maps JavaScript API enabled).

3. Start the dev server

```bash
npm run dev
# open http://localhost:3000
```

## Regenerating Supabase Types

The canonical DB types file is `types/database.types.ts`. When you change the schema in Supabase, regenerate and commit the types:

```bash
npm run update-types
```

Notes:

- Keep `types/database.types.ts` committed in git — it's the source of truth for TypeScript types.
- The `supabase/` folder is optional: keep it if you use the Supabase CLI frequently; otherwise you can remove it and re-run the CLI when needed. Keep any secret files out of source control.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run linter
- `npm run update-types` — (optional) regenerate Supabase types. Use this to pull generated types when the database has been updated

## Project Structure

- `app/` — Next.js routes and layouts
- `components/` — UI components and domain components (map, auth, admin)
- `services/` — Business logic and data access (follow `{feature}.service.ts` pattern)
- `lib/` — Utilities and clients (Supabase client lives here)
- `types/` — Generated Supabase types and shared type exports
- `supabase/` — (optional) Supabase CLI state, migrations, and config

## Implementation Notes

- Google Maps: the project uses `@googlemaps/js-api-loader`. The map loader is made idempotent and components must clean up overlays and listeners on unmount to avoid memory leaks.
- Conventions & design: See [CONVENTIONS.md](CONVENTIONS.md) and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for coding and styling guidelines.

## Deployment

- TBD: Vercel for Next.js; set the same env vars in the deployment environment and configure your Supabase project.

## Contributing

- Read [CONVENTIONS.md](CONVENTIONS.md) before making changes.
- Use conventional commit messages:
  - Format: `type(scope): subject`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
  - Example: `feat(auth): add social login`
