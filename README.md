# SUBMITTED.

Project-help studio site for BTech students — landing page, Typeform-style request form, and a crew-only admin board.

**Stack:** Next.js 15 (App Router) · Tailwind v4 · Framer Motion (form transitions) · Supabase (requests + admin auth) · Resend (emails)

## Run it locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run dev
```

Without Supabase keys, requests are saved to `.data/requests.json` and `/admin` uses `ADMIN_PASSWORD`.
Without a Resend key, emails are logged to the server console instead of sent. So the whole
flow (form → board → delivery email) works before any accounts exist.

## Go live

1. **Supabase** — create a project, run `supabase/schema.sql` in the SQL editor.
   Under Authentication → Users, add each crew member (email + password) and turn **off** public sign-ups.
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   and `ADMIN_EMAILS` (comma-separated crew emails allowed into `/admin`).
2. **Resend** — verify your sending domain, set `RESEND_API_KEY`, `RESEND_FROM`, and `CREW_INBOX`
   (gets an alert for every new request).
3. **Vercel** — import the repo, paste the env vars, deploy. Set `NEXT_PUBLIC_SITE_URL` to the real domain.

## Where things live

| What | File |
| --- | --- |
| All landing copy (steps, tracks, prices, testimonials, crew, FAQ) | `src/lib/content.ts` |
| Colors, fonts, buttons, motion | `src/app/globals.css` |
| Sections | `src/components/*.tsx` |
| The form | `src/components/RequestForm.tsx` |
| Admin board + drawer | `src/components/admin/AdminBoard.tsx` |
| Data layer (Supabase / local file) | `src/lib/store.ts` |
| Emails | `src/lib/email.ts` |

**House rules:** the public site never shows prices, budgets or crew names. It's for Jain University
BTech students only (the server stores `college = Jain University` no matter what the client sends),
and the footer says the crew is independent and not affiliated with the university. Crew names
for the admin "assign to" menu come from the `CREW_MEMBERS` env var, so they never ship to the public bundle.

**Before launch, replace the placeholders:** testimonials and stats in `content.ts` are sample copy,
and crew portraits are generated placeholders — add `photo: "/crew/01.jpg"` (file in `public/crew/`)
to each crew entry.
