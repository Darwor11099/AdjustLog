# AdjustLog

AdjustLog is a fully editable local project for recording inventory part adjustments. It preserves the final Site design and behavior developed in this conversation while remaining independent from the currently published Site.

## Features

- English-only adjustment workflow.
- Large responsive interface for desktop, tablet, and mobile.
- Persistent light and dark modes.
- Adjustment fields: part number, location, quantity, and memo.
- Positive quantities add pieces; negative quantities remove pieces.
- Records automatically stack into expandable accordions using only the normalized part number.
- Search by part number or location.
- Totals for records, unique parts, pieces added, and pieces removed.
- Durable Cloudflare D1 storage with a committed Drizzle migration.
- Accessible native accordion controls and status messages.

## Technology

- React 19 and TypeScript
- Next-compatible App Router through vinext
- Vite
- Cloudflare Workers and D1
- Drizzle ORM and Drizzle Kit
- Tailwind CSS build pipeline with project-specific CSS

## Requirements

- Node.js 22.13 or newer
- pnpm 11 or newer (recommended)
- Git

## Install and run locally

Open a terminal in this folder and run:

```bash
pnpm install
pnpm dev
```

Then open the local address printed in the terminal, normally `http://localhost:3000`.

The local development server uses a project-local Cloudflare/Miniflare D1 database. Local database state is stored under `.wrangler/`, which is intentionally ignored by Git.

## Database

The schema is located at `db/schema.ts`. The initial SQL migration is stored in `drizzle/0000_huge_redwing.sql`.

After changing the schema, generate a new migration:

```bash
pnpm db:generate
```

Do not edit an already-applied migration. Create a new migration for future schema changes.

## Useful commands

```bash
pnpm dev          # Start the local development server
pnpm build        # Create a production build
pnpm start        # Run the production build locally
pnpm test         # Run source-level behavior checks
pnpm lint         # Run ESLint
pnpm db:generate  # Generate a Drizzle migration
```

## Project structure

```text
app/
  api/adjustments/route.ts  Adjustment GET/POST API
  globals.css               Complete responsive light/dark design
  layout.tsx                Metadata and document shell
  page.tsx                  Adjustment form, metrics, search, and accordions
db/
  index.ts                  D1/Drizzle connection helper
  schema.ts                 Adjustment table definition
drizzle/                    Versioned SQL migrations
public/                     Favicon and social preview image
worker/index.ts             Cloudflare Worker entry point
tests/                      Lightweight source behavior checks
```

## Edit the application

- Change UI behavior and content in `app/page.tsx`.
- Change colors, spacing, sizes, dark mode, and responsive behavior in `app/globals.css`.
- Change API validation or persistence in `app/api/adjustments/route.ts`.
- Change database fields in `db/schema.ts`, then generate a migration.

## Publish as a new Site

This local copy intentionally contains no existing `project_id` in `.openai/hosting.json`. That prevents it from replacing the Site already published during this conversation.

To publish it as a separate Site, open this folder in Codex and ask Codex to publish it with Sites. A new Site will be created, and the `DB` D1 binding plus migrations will be provisioned during deployment.

You can also adapt the built Worker output for your own Cloudflare deployment workflow. Always run `pnpm build` first.

## Push to GitHub

The repository is already initialized with an initial commit. Create an empty GitHub repository, then run:

```bash
git remote add origin https://github.com/YOUR-USER/YOUR-REPOSITORY.git
git push -u origin main
```

The published Site from the original conversation is not modified or deleted by this project.
