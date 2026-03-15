# Mind Power

Mind Power is a private, mobile-first 28-day self-improvement app built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

It is intentionally narrow:

- 1 paid program
- 4 weeks
- 28 total days
- 1 audio for each week
- 1 exercise set for each week
- 1 clear daily session flow

## What is included

- Email/password authentication with Supabase
- Onboarding with saved motivation text
- Protected routes for `/dashboard`, `/session`, `/progress`, `/library`, and `/onboarding`
- Dashboard with current day, current week, session status, streak, integrity score, and progress
- Session page with week audio on days 1, 8, 15, and 22
- Daily exercise completion, reflection, and promise-kept check-in
- Local draft persistence for the session form so refreshes do not wipe in-progress input
- Progress page grouped by week
- Library page with public bucket audio URLs
- Supabase SQL schema and seed files

## Project setup

1. Install dependencies.

```bash
npm install
```

2. Create a root `.env.local` file for local development.

You can copy `.env.example` and fill in your real values.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
APP_TIMEZONE=Africa/Johannesburg
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` can be a full URL or just your Supabase project ref. The app normalizes both.
- `APP_TIMEZONE` controls how the app decides what "today" means for day tracking. Set it to your real timezone.
- The storage bucket name is fixed as `mind-power-audio` in both the schema and app code.
- Production deployments do not need a `.env.local` file, but they do need the same environment variables configured in the host platform.

3. In Supabase, enable Email auth.

- Open Supabase Dashboard
- Go to `Authentication > Providers`
- Enable `Email`
- Configure whether email confirmation should be required

4. Run the schema SQL.

- Open Supabase Dashboard
- Go to `SQL Editor`
- Run `supabase/schema.sql`

This creates:

- `profiles`
- `programs`
- `program_weeks`
- `user_programs`
- `daily_sessions`
- RLS policies
- the private `mind-power-audio` storage bucket

5. Run the seed SQL.

- In the same SQL Editor, run `supabase/seed.sql`

This seeds:

- 1 `Mind Power` program
- 4 weekly records with placeholder audio paths and exercise text

6. Upload your audio files to Supabase Storage.

- Open `Storage`
- Open the `mind-power-audio` bucket
- Upload your 4 audio files
- Update the `audio_path` values in `program_weeks` to match the uploaded object paths

Example object paths:

- `week-1/mind-power-week-1.mp3`
- `week-2/mind-power-week-2.mp3`
- `week-3/mind-power-week-3.mp3`
- `week-4/mind-power-week-4.mp3`

7. Replace the placeholder exercise content.

Update the seeded `exercise_text` values in `program_weeks`, or edit the TODO placeholders in `supabase/seed.sql` and re-run the relevant updates.

8. Start the app.

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Important TODO markers

Replace these before using the app with real course content:

- `TODO: Replace with your real Week 1 exercises...`
- `TODO: Replace with your real Week 2 exercises...`
- `TODO: Replace with your real Week 3 exercises...`
- `TODO: Replace with your real Week 4 exercises...`
- Placeholder audio paths like `week-1/todo-week-1-audio.mp3`

The main placeholders live in `supabase/seed.sql`.

## Development notes

- Private routes are protected server-side.
- Public audio URLs are generated from Supabase Storage object paths.
- Missing audio and missing exercise text are handled safely in the UI.
- If today's session is already complete, the session page switches to a read-only summary.

## Netlify deployment

Use the standard Next.js deployment flow in Netlify.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `APP_TIMEZONE`

Recommended build settings:

- Build command: `npm run build`
- Node version: `20` or newer
- Publish directory: let Netlify use its detected Next.js defaults

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
