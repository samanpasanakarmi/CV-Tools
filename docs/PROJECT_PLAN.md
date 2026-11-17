> **LEGACY NOTE (23 Oct 2026):** This document describes the original browser-only prototype. Aino has now requested logins, cloud-backed accounts, reusable profiles, and multiple CVs. For current decisions use `CUSTOMER_CONFIRMED_REQUIREMENTS.md`, `FOUR_MEMBER_SPRINT_BACKLOG.md`, and `SETUP_SUPABASE.md`.

# CV Tool — team plan and backlog

## Project goal
A job seeker stores CV information once, selects relevant details for a specific opportunity, and produces a professional PDF CV and other exports with minimal effort.

**Initial customer:** Aino Haavisto, Metropolia. Customer has not yet confirmed the proposed implementation details.

## Success definition for our proposal (verify in customer meeting)
1. Users create and edit personal details and career records without losing them on page refresh.
2. Users include/exclude individual jobs, projects, education or skills and see the effect in preview.
3. A readable A4 PDF can be saved with no editor UI printed.
4. Users can export all CV data to JSON, import it, and export selected text.
5. Clear controls and keyboard access; validated with at least two student testers.

## Four roles / primary issue ownership

| Member | Responsibility | Review partner |
| --- | --- | --- |
| 1 (coordinator) | Customer contact, GitHub Project board, overall app UX and integration | Member 2 |
| 2 (editor) | Personal form, add/edit/delete/reorder entries, include/exclude | Member 3 |
| 3 (designer) | CV templates, responsive layout, print and visual accessibility | Member 4 |
| 4 (data + QA) | Persistence, JSON/TXT exports, tests, CI and QA records | Member 1 |

Everyone participates in sketching, testing, reviews and customer demos. **Do not treat coordinator as a non-coding role.**

## Course schedule

### Design sprint: 23 October–8 November 2026
- **MAP** (starting now): Confirm persona, goals, journey, constraints, customer success definition. M1 records requirements; all 4 map journey.
- **SKETCH** (by 28 October): Four individual solution sketches; M3 collects sketches, M2 prepares key screen fields.
- **DECIDE** (29 October): Vote on HMW notes / ideas; agree design and priority; M1 writes decision notes.
- **PROTOTYPE** (by 4 November): Create a paper/Figma-style screen prototype showing create → select → preview → export. M3 leads; all review.
- **TEST** (5–8 November): Gather feedback from customer and users. M4 records issues; M1 submits agreed prototype in OMA by **8 November**.
- Design artifact checklist: problem statement, user journey, HMW notes, sketches, decision rationale, screenshots/prototype, feedback notes.

### Development sprint 1: 9–22 November 2026 — MVP
The starter already demonstrates many features, but the team must verify customer expectations, assign individual work, improve implementation and test it.

| Issue ID | Owner | Deliverable and acceptance criteria | Priority |
| --- | --- | --- | --- |
| CV-01 | M1 | Repository setup; issue board; invite 3 collaborators; protected `main`, README and sprint docs | Must |
| CV-02 | M1 | Accessible navigation and onboarding: no blocking controls, usable on mobile | Must |
| CV-03 | M2 | Profile editor: required/optional fields agreed with customer; update visible in preview | Must |
| CV-04 | M2 | Experience and education CRUD, ordering and include/exclude operate correctly | Must |
| CV-05 | M3 | At least one customer-approved CV template, consistent styling | Must |
| CV-06 | M3 | A4 print-to-PDF works in Chrome/Edge without control panel | Must |
| CV-07 | M4 | Browser storage survives refresh, JSON backup round trip tested | Must |
| CV-08 | M4 | Automated model tests + CI and manual smoke-test record | Must |
| CV-09 | ALL | Customer feedback review/demo and submit MVP GitHub repo link in OMA by **22 November** | Must |

### Development sprint 2: 23 November–5 December 2026 — polish and completeness

| Issue ID | Owner | Deliverable and acceptance criteria | Priority |
| --- | --- | --- | --- |
| CV-10 | M2 | Projects, skills, languages, certificates editor tested with realistic sample data | Must |
| CV-11 | M3 | Second optional template, typography/print improvements and page-break fixes | Should |
| CV-12 | M4 | TXT export, defensive JSON imports, backup and clear-data UX | Must |
| CV-13 | M1 | Help text, accessibility keyboard walkthrough and documentation integration | Must |
| CV-14 | ALL | Review real customer feedback; fix accepted highest priority items | Must |
| CV-15 | ALL | Full application, customer presentation and OMA GitHub link by **5 December** | Must |

### Final week: 6–13 December 2026

| Issue ID | Owner | Deliverable |
| --- | --- | --- |
| CV-16 | M1 | Coordinate final customer meeting, product demo, customer-approved delivery format |
| CV-17 | M2 | Document features and known limitations; verify examples |
| CV-18 | M3 | Screenshots and class presentation visual walkthrough |
| CV-19 | M4 | Final QA report, requirements (software and hardware), user guide, repeat tests |
| CV-20 | ALL | Self/peer reviews, presentation participation and final submission in OMA by **13 December** |

## Definition of Ready (before work starts)
- An issue has a clear goal, acceptance checks, owner, priority and any blockers.
- Files/architecture changes impacting two members are briefly discussed before editing.

## Definition of Done (before issue moves to Done)
- Feature works locally with sample data.
- Relevant tests pass with `npm run check`.
- GitHub PR links the issue, at least one other teammate reviews it.
- No real personal data or credentials in commits.
- UI changes include a screenshot; docs updated where needed.
- PR merged into `main`, issue closed, board updated.

## GitHub Projects board
Use columns **Backlog → Ready → In progress → In review → Done**. Add each CV-XX item as a GitHub Issue (number assigned by GitHub may differ). Labels: `design`, `frontend`, `data`, `testing`, `documentation`, `bug`, `sprint-1`, `sprint-2`, `priority-high`. Limit active work to ~1 issue per teammate. Update after daily Scrum.

## Risks and decisions to confirm
- Local storage does **not** move between browsers/devices; is that acceptable?
- The initial PDF solution uses Print to PDF rather than a programmatically generated file.
- Does the customer need several separately named tailored CVs or a selection each time?
- Should the app support Finnish and English?
- Accessibility and privacy requirements need customer sign-off.
- Third-party templates/fonts/services would require approval and privacy review.
