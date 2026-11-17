# Four-member development plan — AI Smart CV Builder v0.7

Feature branch recommendation: `feature/ai-smart-cv-v07`. Before merging, divide the code changes into independently reviewable GitHub issues and pull requests.

| Team member | Main owner | Files and acceptance criteria |
|---|---|---|
| Member 1 | AI Builder user journey / UX | `index.html`, `src/app.js`, `styles.css`; accurate consent, job description form, editable review, visible unsaved state |
| Member 2 | Profile-to-CV integration | `src/ai.js`, `src/workspace.js`, `src/model.js`; selected IDs validated, new CV saved, previous CV untouched, 6 template compatibility |
| Member 3 | Secure server / API integration | `src/api.js`, `supabase/functions/ai-tailor-cv`, `supabase/migrations`; authenticated JWT, RLS-scoped profile read, secret key, structured output, quota |
| Member 4 | Quality, tests, privacy and deployment | `tests/ai-v07.test.js`, docs, GitHub CI; test two accounts, no secret leaks, hallucination review, customer approval notes |

All four should review pull requests and participate in Scrum. Daily recordings, customer feedback and sprint submissions continue according to the course instructions.

## Suggested GitHub issues
1. `AI-01` authenticated Edge Function: fetch own profile under RLS, validate job description, no service-role exposure.
2. `AI-02` privacy-preserving profile extraction and OpenAI Structured Outputs schema.
3. `AI-03` form and explicit consent UI.
4. `AI-04` review editor with relevant experience/skill selection and gaps.
5. `AI-05` persist ONLY after human approval, create new CV, never overwrite.
6. `AI-06` daily quota, origin restriction and API cost monitoring.
7. `AI-07` automated tests, two-account integration and live deployment checklist.

## Customer demonstration acceptance scenario
An authenticated user already has two real experience entries and some skills in My Profile. They paste a job description for Customer Service Representative; AI selects customer-facing experience, skips unrelated skills, drafts a *verifiable* summary, and highlights missing qualifications. The user edits the wording, unchecks one irrelevant item, confirms review and saves it as a **third CV**. Their original CVs stay unchanged. They select Modern template and export PDF. A second account cannot access any of the first account's data.

## Not implemented in this release
Automatic web-page scraping of job adverts, cover letters, multiple languages, provider key management through a UI, automated credibility validation, automatic fact-checking, API spend alert configuration or automatic production deployment. These can be evaluated after customer approval.
