# CV Studio v0.7 — connect the REAL AI Builder

This is an extension of the existing v0.6 web application, not a replacement. The AI Builder calls a **Supabase Edge Function** using the current user session. The function loads only the signed-in user's saved profile through RLS, applies a per-user limit, calls OpenAI using a **server-side** secret, and returns an **unsaved draft** for human review.

## Requirements
- Supabase project with email/password authentication and verified RLS. See `docs/technical/SETUP_SUPABASE.md` and `docs/testing/SECURITY_TESTS.md`.
- Node.js 20+ for the frontend.
- Supabase CLI and access to deploy functions, or dashboard function deployment support.
- An OpenAI API key with API billing/credits (a ChatGPT subscription does not automatically cover API requests).
- An HTTPS URL for the deployed web app (GitHub Pages works with the existing workflow).

## 1. Configure real Supabase accounts
1. In your Supabase project's SQL Editor, run `supabase/schema.sql` if you have not already. Do not run destructive commands against your production database.
2. Run `supabase/migrations/20261106_ai_usage.sql`. This creates a private usage counter and `consume_ai_quota()` authenticated RPC for a **5-request UTC-day limit**. This step must be completed before AI requests work.
3. In `src/config.js`, set the public Supabase project URL and the **publishable** key only. Do **not** put an OpenAI key, a Supabase secret key or a `service_role` key in any frontend or GitHub Pages file.
4. Test existing profile/CV saving and two-account isolation before testing AI.

## 2. Deploy server-side AI Function
From this project's root:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set OPENAI_API_KEY="your_server_side_key"
supabase secrets set OPENAI_MODEL="gpt-4.1-mini"
supabase secrets set ALLOWED_ORIGINS="https://YOUR_GITHUB_USERNAME.github.io,http://localhost:4173,http://127.0.0.1:4173"
supabase functions deploy ai-tailor-cv
```

Set `ALLOWED_ORIGINS` to **the exact origin** of your web app (`scheme + hostname + optional port`, no path or trailing slash). Do not use `*`. GitHub Pages paths such as `/cv-studio/` are not part of the origin. The function has `verify_jwt = true` in `supabase/config.toml` and also validates the user through `withSupabase({auth:'user'})`. Requests with missing/invalid user tokens cannot run the AI request.

**Never paste a server-side key in a public repository, frontend config, or screenshot.** Rotate it immediately if it is exposed.

> Note: Supabase CLI and project UI evolve. For current authentication patterns, see https://supabase.com/docs/guides/functions/auth . For latest OpenAI Structured Outputs docs, see https://developers.openai.com/api/docs/guides/structured-outputs .

## 3. Start real web app

```sh
npm start
```

Open `http://localhost:4173`, sign in to your *real* account, fill and **save** My Profile, then choose **✦ AI Builder**.
1. Fill the target role, optional employer, and paste a **real** job description (30–10,000 characters).
2. Choose a CV template and tick the external-AI data-processing consent box.
3. Click **Generate suggestions**. The server sends only a reduced set of profile qualifications and the job description to OpenAI. The app intentionally excludes dedicated name, phone, email, address, website and photo fields. However, **free-text summary and work descriptions may still contain personal information**; users should check before consenting.
4. Review the proposed headline, summary, suggested entry selection, strengths and missing requirements. Uncheck irrelevant entries and edit the words if needed.
5. Tick **I have checked** and click **Approve & save new CV**. Only then is a new CV row created in Supabase. Existing CVs are left unchanged.
6. Check that the new CV opens in the normal editor and exports using the existing PDF/TXT/JSON controls.

The AI does not write to the database or silently create a CV. The function sends `store: false` to the OpenAI API. This controls API-side response storage, but **does not by itself establish full deletion or zero-retention of provider data**. Review current provider retention terms, a privacy notice and appropriate GDPR basis before production.

## 4. User-facing errors / troubleshooting
- **Setup screen instead of login:** `src/config.js` is not configured.
- **401 Unauthorized:** sign in again; verify your Supabase project URL, user JWT and Edge Function auth config; don't supply the publishable key as a bearer token.
- **403 Origin not allowed:** add the exact hosted website origin to `ALLOWED_ORIGINS` and redeploy/reconfigure it.
- **AI request limit is not configured:** run the quota SQL migration, and check function permissions.
- **AI service is not configured:** set `OPENAI_API_KEY` in Supabase secrets (never in frontend).
- **429 Daily limit:** a user has already made five AI requests in the current UTC day.
- **No saved profile:** save genuine qualifications in My Profile, not just contact details.
- **OpenAI error/timeout:** verify provider billing, model access, dashboard logs (do not log raw CV data) and quota. A failed request may still count against the daily limit.

## 5. Security / production gates
- Confirm RLS: user A cannot read or modify user B's profile and CVs (see existing two-account check).
- Confirm an unauthenticated Edge Function call fails; an authenticated user receives recommendations based on **their** profile only.
- Verify no `OPENAI_API_KEY` or other secret exists in `dist/` or client bundle.
- Confirm selected IDs cannot refer to items not present in that user's profile; the Edge Function discards invalid IDs.
- Review hallucination risks manually; summaries are suggestions, not verified certifications.
- Configure an enforceable budget/monitoring alert for API cost; daily quota is an additional guard, not financial protection.
- Review data retention, consent, privacy notice, account deletion, EU data-processing agreements, accessibility and incident response before making a public service.

## 6. Build and test

```sh
npm run check
npm run build
```

`node --test` runs the Node unit/integration tests without calling the actual OpenAI or Supabase services. **A live integration/security test remains necessary** after connecting your own project. This package contains no keys and cannot authenticate on your behalf.
