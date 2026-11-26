# Requirements traceability

Baseline: team-reported [October 23 requirements](CUSTOMER_CONFIRMED_REQUIREMENTS.md), [November 6 feedback](CUSTOMER_FEEDBACK_V06.md) and course brief as recorded there. This is a retrospective mapping prepared for review on 26 November 2026, not a signed customer acceptance record.

| ID | Requirement | Implementation / evidence | Verification status |
| --- | --- | --- | --- |
| R01 | Web application | index.html, src/app.js, server.mjs; build workflow | Local use reported; public deployment failed |
| R02 | Register and log in | src/api.js, src/auth-flow.js | Mock tests; independent live email flow pending |
| R03 | Reuse personal and career information | profiles JSONB, src/model.js, src/workspace.js | Model/workspace tests; live persistence evidence pending |
| R04 | Multiple job-specific CVs | cvs JSONB, src/workspace.js | Workspace and API tests; structured manual record pending |
| R05 | Keep data private | supabase/schema.sql, src/api.js, core security tests | SQL and client code present; mandatory live two-account test pending |
| R06 | Attractive PDF CV | src/preview.js, styles.css, browser print | Markup tests; current print acceptance pending |
| R07 | Choose included data | Selection controls and contact toggles, composeCv | Automated tests pass |
| R08 | Non-PDF export | cvAsText, JSON export and backup | Automated model tests; manual file review pending |
| R09 | Exact work dates | validateExperience, displayDate | Automated date tests pass |
| R10 | Simpler dashboard | renderDashboard, renderUI | Implemented; current customer acceptance pending |
| R11 | More professional templates | Nine templates; PR #1 | Template tests pass; visual/customer review pending |
| R12 | Optional photos | safePhoto, preparePhoto, photo templates | Source and automated tests; manual photo checks pending |

## Later team enhancements (not assumed customer requirements)

| ID | Enhancement | Evidence | Status |
| --- | --- | --- | --- |
| E01 | Core hardening / AI paused | [PR #2](https://github.com/samanpasanakarmi/CV-Tools/pull/2) | Merged, CI pass; live verification pending |
| E02 | Autosave and custom fields | [PR #3](https://github.com/samanpasanakarmi/CV-Tools/pull/3) | Merged, CI pass; developer reported local success; formal acceptance pending |
| E03 | Per-CV section ordering | [PR #4](https://github.com/samanpasanakarmi/CV-Tools/pull/4) | Merged, CI pass; manual acceptance pending |

## Sign-off

Confirm these items with the customer: shared-profile update behavior, browser PDF workflow, accepted export formats, photo layout, privacy/retention responsibilities, final delivery format and whether later enhancements meet the need. Store signed/dated customer evidence in approved private course storage; link a non-sensitive reference in the final report. Do not mark acceptance complete without real confirmation.
