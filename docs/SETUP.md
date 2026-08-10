# Setup

## 1. Create a Supabase project

Create a project at https://supabase.com/dashboard. In **Project Settings → API**, copy the project URL and the browser-safe publishable/anon key. Do not use a service-role key in this app.

Install and authenticate the CLI, link the project, and apply the tracked migrations:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migrations create:

- `public.tracks`, including persisted display order;
- the private `track-audio` and `track-covers` buckets;
- public policies limited to published rows and their referenced objects;
- owner-only policies for drafts and catalog mutations;
- `private.owner_allowlist` and the stable owner authorization function.

Do not edit a migration that has already been applied. Add a new migration for future schema changes.

## 2. Configure the environment

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Local or deployed origin, including `https://` in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe publishable/legacy anon key. |
| `OWNER_EMAIL_ALLOWLIST` | Comma-separated owner email addresses, checked server-side. |
| `OWNER_LOGIN` | Short login entered on `/admin/sign-in`. |
| `OWNER_LOGIN_EMAIL` | Supabase Auth email mapped to that short login. |

Brand variables are optional and default to DJey Music. Upload limits are optional byte counts; the defaults are 100 MB for audio and 10 MB for dormant cover compatibility.

Use the same variables in local development and in the hosting provider. Never prefix server-only owner variables with `NEXT_PUBLIC_`.

## 3. Create and authorize the owner

1. In the Supabase dashboard, open **Authentication → Users**.
2. Create a user whose email exactly matches `OWNER_LOGIN_EMAIL` and set a strong password.
3. Open **SQL Editor** and run the statement below after replacing the example email:

```sql
insert into private.owner_allowlist (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = lower('owner@example.com')
on conflict (user_id) do update
set email = excluded.email;
```

4. Put the same normalized email in `OWNER_EMAIL_ALLOWLIST`.
5. Sign in at `/admin/sign-in` with `OWNER_LOGIN` and the Auth password.

Both the environment allowlist and the database mapping are required. Public signup is disabled by `supabase/config.toml`.

## 4. Run locally

```bash
npm ci
npm run dev
```

Open http://localhost:3000 for the player, http://localhost:3000/admin for management, and http://localhost:3000/api/health for a small health response.

For local Supabase development with Docker:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:test
```

`supabase:reset` deletes and recreates only the local database.

## 5. Deploy

### Vercel

Import the GitHub repository, add all environment variables, set `NEXT_PUBLIC_APP_URL` to the production domain, and deploy. Server routes and private audio redirects require a normal Next.js deployment, not a static export.

### Docker

```bash
docker build -t open-music-player .
docker run --env-file .env.local -p 3000:3000 open-music-player
```

The container listens on port `3000`. Configure your platform health check to `/api/health`.

## Security checklist

- Keep both Storage buckets private.
- Never expose a service-role key to the browser or commit it.
- Keep public catalog queries constrained to `status = published`.
- Do not weaken RLS to make setup easier.
- Use platform secrets for all production environment variables.
- Back up the Supabase project before applying later production migrations.
