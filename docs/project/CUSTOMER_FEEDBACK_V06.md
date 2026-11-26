# CV Studio: follow-up customer feedback and feature acceptance (6 November 2026)

**Customer:** Aino Haavisto, Metropolia. Feedback relayed by project team after the customer-approved design sprint.

| Customer feedback | Implemented in real project | Acceptance check |
|---|---|---|
| Work/job details must have a precise date with day, month and year | Master profile → Work experience uses full calendar start/end dates; optional “Currently working here” | Enter 2024-06-04, choose 2026-09-30: printed CV shows `04/06/2024 – 30/09/2026`; reject invalid or reversed dates |
| Dashboard should show less information | Removes metrics cards and hides resume preview on Dashboard; displays greeting, small CV count, recent CVs, Create/Edit actions | On dashboard see only essential controls and recent CVs |
| More professional CV templates | Adds Minimal, Executive, Photo sidebar, Photo header to Modern and Classic | All six appear in selector and preview/printing use chosen style |
| Some templates should offer photos | Reusable profile picture upload, per-CV photo visibility, photo only in photo-enabled designs | Upload picture, select photo template, toggle picture off; other CVs unaffected |

## Decisions to confirm with customer

1. Dates are shown as DD/MM/YYYY. Is this the display convention she prefers (rather than “4 June 2024”)?
2. Is browser Print → Save as PDF acceptable, or is a direct download button required?
3. Which photo-enabled templates should be retained after user testing?
4. Does she need a different photo for each individual CV or is a single optional master-profile photo sufficient?

## Existing functionality preserved

- Real email/password Auth and password recovery Supabase integration.
- Reusable profile, separate job/company CVs, visibility of selected experience and skills.
- Database profile/CV model, owner-only SQL RLS policies, JSON/TXT and PDF printing.
- Team GitHub workflow and source tests.

**Still required:** live Supabase credentials/configuration; email and two-account access tests; a published site URL; privacy documentation and secure login-account deletion.
