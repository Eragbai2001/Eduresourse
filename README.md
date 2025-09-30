# Eduresourse

Eduresourse is a community-driven hub for sharing past exam questions and study resources. Students and educators can upload past questions, tag them by department and level, and build a searchable library together. The project is early-stage and actively evolving — contributions and feedback shape what comes next.

## Key highlights

- Community uploads: anyone can add past questions and materials.
- Organized by department & level: filter and find relevant resources fast.
- Lightweight uploader with previews and file management.
- Early-stage & growing: features are rolling out — your contributions matter.

## Quick start

### Prerequisites

- Node.js 18+ (or the version your environment uses)
- npm, pnpm, yarn or bun
- A Supabase project (optional, required for uploads/auth in production)

### Local dev

1. Install dependencies:

```bash
npm install
# or pnpm install
# or yarn install
```

2. Create a `.env.local` file (copy `.env.example` if present) and add the Supabase keys used by the app (if you plan to test uploads/auth):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Add any other environment variables used by your deployment
```

3. Run the dev server:

```bash
npm run dev
# or pnpm dev
# or yarn dev
# or bun dev
```

Open http://localhost:3000 in your browser.

### Build & production

```bash
npm run build
npm run start
```

## Notes and implementation details

- The app is built with Next.js (App Router) + React + TypeScript and uses Tailwind CSS for styling.
- File uploads are handled via Supabase Storage (see `lib/supabase.ts`). Uploaded files are stored and the DB API is used to persist metadata.
- Cover colors are randomized client-side to avoid SSR hydration mismatches (you may see a temporary neutral state on first render).
- Image previews for local uploads use object URLs (rendered with `<img>`). For production optimization you can swap them to `next/image` with a custom loader, but object URLs are fine for previews.

## Why this project matters

Eduresourse aims to be the go-to community archive for past questions — a place where learners give back by uploading what helped them study. The platform is intentionally simple so contributors can start sharing immediately. Because the project is early and community-driven, now is the best time to add content and shape how resources are organized.

## Contributing

- Found a bug or want a feature? Open an issue with a clear description and reproduction steps.
- Want to help build? Fork the repo, create a branch, and open a pull request with a short summary of the change.
- Code style: follow existing TypeScript + React patterns. Tailwind is used for styling.

### Guidelines for uploads

- Please only upload materials you have permission to share. Respect copyright.
- Add department and level tags when uploading to help others find resources.

## Troubleshooting

- Hydration mismatch errors: these often come from server/client differences for values like Math.random or Date. The code already defers random cover-color generation to the client to reduce those errors.
- If preview images don't appear, check the file input and ensure your browser allows object URLs. For deployed uploads, confirm your Supabase keys and storage permissions.

## Roadmap ideas

- Full-text search of uploaded resources
- Resource moderation & reporting tools
- User profiles, favorites, and download counts
- Better mobile responsiveness and accessibility improvements

## License

MIT — see LICENSE file if present.

## Contact

- Questions or feedback: open an issue in this repo.
- Want help implementing a feature? Add a short issue describing the goal and tag it "help wanted".

Thank you for contributing — this is a community project, and every upload and issue helps the library grow.
