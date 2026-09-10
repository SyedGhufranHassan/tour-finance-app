# Kumrat Tour Finance

Mobile-first financial accountability for **Kumrat Tour 2K26**:
Imamia Colony → Kumrat Valley → Imamia Colony, 17–18 September 2026.

## Current application

- Premium responsive dashboard with balance, collected funds, expense totals, member payment progress, and cash/online summaries.
- Fast income and expense entry with duplicate-submit protection, payment receiver/payer tracking, categories, locations, dates, times, and safe delete confirmation.
- Member contribution tracking with Paid, Partial, and Pending states.
- Reports for expense categories, income vs expense, and person-wise money custody.
- CSV export and print-ready report view.
- PWA manifest and mobile-first layout.
- Mountain/travel visual language: route context, Kumrat landscape illustration, map and mountain iconography.
- A clean empty initial state: no demo members, income, or expense transactions are seeded.
- Local persistence is included as a safe development fallback. When Supabase variables are configured, the Supabase client is available for the production data layer.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use `npm run lint`, `npm run test`, and `npm run build` before deployment.

## Environment variables

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Only the public anon key belongs in the Vite client. Never expose a Supabase service-role key.

## Supabase setup

1. Create a Supabase project.
2. Apply `supabase/migrations/202609100001_initial_schema.sql` with the Supabase CLI or SQL editor.
3. Enable email/password auth and configure the redirect URL for the deployed app.
4. Configure the private `receipts` storage bucket created by the migration.
5. Create the first authenticated user through the app.
6. Create the initial tour and its owner record through the production repository adapter. RLS policies restrict tour-scoped records to the owner.

The migration includes foreign keys, positive amount constraints, date constraints, useful indexes, audit-log structure, receipt storage policy, and owner-scoped RLS. Contributor/member identity and the person receiving or paying money are intentionally separate relationships.

## Deployment

### Vercel

Import the GitHub repository as a Vite project. Set the two `VITE_SUPABASE_*` environment variables in Vercel for Preview and Production, then deploy. Vercel should use the default build command `npm run build` and output directory `dist`.

Detailed deployment checklist:

1. Push the code to GitHub.
2. In Vercel, choose **Add New → Project**, import `SyedGhufranHassan/tour-finance-app`, and keep the Vite defaults.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings → Environment Variables for Production and Preview.
4. Deploy and copy the Vercel URL.
5. In Supabase → Authentication → URL Configuration, set the Vercel URL as the Site URL and add its auth callback URL.
6. Apply the migration before creating financial records.
7. Open the production URL, create the organizer account, create the Kumrat tour, add people/members, then record income and expenses from zero.
8. Verify refresh, logout/login, mobile layout, RLS isolation, CSV export, and receipt access.

## Production readiness note

The migration, RLS policies, authentication gate, storage policy, and empty-state UI are included. The current browser fallback is intentionally local-only; the UI must be switched to the Supabase repository adapter before treating Vercel as the production source of truth. Do not use the fallback for real tour accounting across devices, because local browser data is not shared between users or devices.

### GitHub

Keep `.env.local` out of version control. Suggested commits:

```text
feat: initialize tour finance application
feat: add supabase schema and row level security
feat: add transaction and reporting flows
feat: add pwa and deployment documentation
```

## Data safety and future work

The browser fallback is intentionally local-only for development and demo use. Production multi-user persistence requires completing the Supabase repository adapters and auth onboarding against the configured project; the schema and policies are included so that integration is reproducible. Full offline transaction queuing is not claimed until it has been connected to an IndexedDB sync queue and tested against conflict cases.
