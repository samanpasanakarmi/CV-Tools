## v0.7 update (6 November 2026)
Added authenticated AI CV Builder code, human-review workflow, private RLS profile retrieval in Edge Function, daily quota SQL and OpenAI API integration. Unit tests and static build pass. **Live Supabase and OpenAI integrations have not been tested, deployed or verified.** See `docs/AI_V07_SETUP.md`.

---

> Historical v0.4/v0.5 planning notes. For the current real cloud project, start with `README.md` and `docs/REAL_PROJECT_NEXT_STEPS.md`.

# v0.4 status — verified versus pending

## Implemented and tested locally
- One reusable master profile linked to multiple independent CV variants.
- Job/company fields and CV-specific headline, summary, template, selected experience, education and skills.
- Contact-visibility toggles per CV, without altering other CVs.
- Fictional demo data, dashboard, new-CV form, duplication, deletion, and preview.
- Browser PDF print UI plus TXT/JSON exports.
- CloudApi wired to Supabase Auth and PostgREST; SQL migration defines owner-only RLS grants and policies.
- Automated Node.js tests and static website build. Browser-tested demo workflows include editing, CV isolation, creation, cloning, updates to shared profile, and JSON export.

## Not verified or incomplete
- **Live Supabase signup/login and actual persistence:** No team project credentials supplied; connection and end-to-end account testing required.
- **Real cross-user isolation:** SQL rules are written but not deployed and tested against two accounts.
- Account deletion, reset-password flow, privacy policy, retention controls and formal GDPR/controller agreements.
- Deployment to a public URL; HTTPS, browser/network security and customer approval.
- Any guarantee that the project is safe for real personal CV details.

## Validation
Run `npm run check` and `npm run build`. For security, manually test signed-in Account A versus Account B as described in `docs/SETUP_SUPABASE.md`. **Use fictional data until these checks and customer sign-off pass.**


## Update for v0.5 (November 4, 2026)

The original status above pertains to v0.4. Version 0.5 adds account password change, email recovery, confirmation-link callback, full JSON backup and the authenticated CV-data erasure RPC. API unit tests and standalone demo browser walkthrough pass. Live Supabase integration, two-account RLS isolation, email delivery, production account deletion and customer-approved privacy notice are not verified or completed. See `WHAT_CHANGED_V05.md` and `SECURITY_TESTS.md`.
