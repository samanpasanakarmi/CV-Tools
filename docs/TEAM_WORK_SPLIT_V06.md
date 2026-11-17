# v0.6 work plan — four members

Use one GitHub repository and `main` branch protection. Assign each task as an Issue. Each member should commit small, reviewable changes under a `feature/` branch and open a PR, with one other member reviewing before merge.

| Owner | GitHub issue | Branch | Changed areas and review responsibility |
|---|---|---|---|
| Member 1 — Scrum/integration | Simplify Dashboard/Navigation | `feature/dashboard-cleanup` | `src/app.js`, `styles.css`, screenshot review, customer feedback log |
| Member 2 — Master profile | Exact work date inputs and validation | `feature/experience-exact-dates` | `src/model.js`, `src/app.js`, `tests/customer-feedback-v06.test.js`; validate legacy dates |
| Member 3 — CV designer | Six CV themes and PDF layouts | `feature/cv-themes` | `src/preview.js`, `styles.css`, template selection; print on Chrome and Edge |
| Member 4 — Security/testing | Profile photo handling, Supabase regression | `feature/photo-security` | Image validation, photo visibility, profile JSON, cross-account RLS tests with disposable accounts |

Because this release was assembled as an integrated update, split review and future changes into individual issues rather than claiming every past change was independently authored. Ask each member to explain their code and reimplement/test their assigned feature if this is being assessed for individual contribution.

## Review checklist

- Each PR references an Issue and screenshots/recording where helpful.
- `npm run check` and `npm run build` pass before merge.
- At least one other member approves the PR.
- No private keys, passwords, actual CVs, or users' profile photos in the repository.
- Capture evidence of each contribution and ongoing recorded daily Scrum meetings in accordance with the course requirements.
