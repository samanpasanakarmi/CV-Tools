# CV Studio v0.7 — AI Smart CV Builder (Real Web App)

**Newest release:** Builds on v0.6 customer-approved CV Studio. Adds an authenticated Supabase Edge Function using a **server-only OpenAI API key**, job-description tailoring from the signed-in user’s saved profile, an explicit data-processing consent step, and **mandatory human review before saving a separate CV**. No fake-login or offline demo mode.

**Start here:** [`docs/AI_V07_SETUP.md`](docs/AI_V07_SETUP.md) · [`docs/AI_V07_TEAM_PLAN.md`](docs/AI_V07_TEAM_PLAN.md)

**Live status:** Code and tests provided; a real Supabase project, quota SQL migration, live Edge Function deployment and OpenAI billing/key are required. Live account isolation and provider calls have **not** been verified here.

---

# CV Studio v0.6 — Real web application

Metropolia Multidisciplinary Innovation Project • Customer: Aino Haavisto • Four-person team.

**This release builds directly on the v0.5.1 real-only web application. It does not include a fictional login or a demonstration data mode.** Supabase must be configured to use accounts and saved CVs.

## v0.6 changes requested by Aino (6 November 2026)

- **Exact work dates:** Work experience start and end are full calendar dates. They display in CVs and text exports as **DD/MM/YYYY**, e.g. `04/06/2024 – 30/09/2026`. An ongoing job can have `Present` instead of an end date. Impossible dates or end dates before start are rejected when saving the profile. Prior month/year-only strings are preserved and explicitly flagged for completion, not assigned a guessed day.
- **Simplified dashboard:** Shows a greeting, saved CV count, the latest three CVs, and primary actions. The large right-hand preview is hidden outside the profile/CV editor to reduce clutter.
- **Six CV templates:** Modern, Classic, Minimal, Executive, Photo sidebar and Photo header. Templates are chosen independently for each CV.
- **Optional profile picture:** Upload PNG/JPEG/WebP (4 MB input limit), crop and resize locally to a bounded JPEG, and save it within the user's private master profile record. Only the two photo templates display the image, and each CV has its own `Show my saved profile picture` switch. No publicly accessible image bucket or third-party image URL is used.

The master profile remains reusable across independently customizable job CVs. CV creation, editing, duplication, deletion, PDF printing, TXT/JSON export, password recovery and account data backup remain in place.

## Set up for the real online project

1. Create **your own team-controlled Supabase project** (choose an EU region in consultation with the customer).
2. Execute `supabase/schema.sql` in Supabase SQL Editor. The data model stores profile and CV JSON, so the new date, image and template fields **do not require a table migration** from v0.5.1.
3. Configure Email authentication and email confirmation; add local and deployed URLs under **Authentication → URL Configuration**.
4. Edit `src/config.js` with the **HTTPS Project URL** and **public publishable key only**. **Never add a `service_role` key, `sb_secret` key or password.**
5. Run `npm start`; open **http://127.0.0.1:4173/** in Chrome or Edge.
6. With disposable accounts, verify register → sign in → save profile with full dates/photo → create two CVs → choose different templates → export PDF → log out → log back in → data is still there.
7. Run two-account data isolation tests in `docs/SECURITY_TESTS.md` before inviting real users. Deploy `dist/` over HTTPS through the GitHub Actions workflow after `npm run check` and `npm run build`.

**Commands (Node 20+):**

```bash
npm start       # local website (requires a configured Supabase project to log in)
npm run check   # syntax and 38 automated tests
npm run build   # publishable static files in dist/
```

## Existing data and privacy

Old CVs with `modern` and `classic` styles continue to load. Existing experience dates like `Jan 2024` are not changed or given a fictional day; users need to select full start/end dates in **My Profile → Work experience** before saving updated experience. Updating the reusable profile also updates the information that appears in existing CVs. Photos are part of the JSON profile and are included in a full account backup—handle downloaded backups carefully. Deleting a photo and saving the profile removes it from the saved profile; copies previously exported to PDF/JSON cannot be recalled.

The supplied SQL implements row-level owner policies, but **live account authentication and cross-account privacy have not been tested against your actual Supabase instance**. A privacy notice, full account-deletion workflow, deployment and customer approval are still needed before launch to the public. This is not a claim of completed security audit or GDPR compliance.

## Documentation

- `docs/CUSTOMER_FEEDBACK_V06.md` — feedback-to-feature matrix and acceptance checklist
- `docs/TEAM_WORK_SPLIT_V06.md` — four-member GitHub issue/PR plan
- `docs/SETUP_SUPABASE.md` — cloud setup
- `docs/SECURITY_TESTS.md` — live isolation tests
- `docs/WEB_APP_DEPLOYMENT.md` — GitHub Pages deploy instructions
