> Historical v0.4/v0.5 planning notes. For the current real cloud project, start with `README.md` and `docs/archive/REAL_PROJECT_NEXT_STEPS.md`.

# CV Studio v0.5 — four-person sprint handoff

## Goal for the 22 November MVP

A verified user can log in, save one reusable profile, create two different CVs for two employers, save both privately, log out, return, and download a PDF. Account A must not be able to read account B's content. Production security and privacy acceptance are separate work.

## Suggested ownership (everyone reviews and tests)

| Member | Primary code | Responsibility / PR examples |
| --- | --- | --- |
| 1: Scrum & integration | `index.html`, `styles.css`, deployment, `.github/` | layout responsiveness; Pages deployment; Scrum recordings; PR review |
| 2: Reusable profile | `src/model.js`, profile section of `src/app.js` | master profile and education/experience editing; validations |
| 3: Tailored CVs and export | `src/workspace.js`, `src/preview.js` | selection per CV, templates, print/PDF output |
| 4: Auth, data & security | `src/api.js`, `src/auth-flow.js`, `supabase/schema.sql` | login, recovery, two-account test, SQL policy reviews |

All members make small feature branches, write tests, and open pull requests. Sensitive code changes need a second reviewer. Follow `docs/archive/GIT_TEAM_GUIDE.md`.

## Git branch examples

- `feature/responsive-login`
- `feature/profile-validation`
- `feature/pdf-layout`
- `feature/auth-recovery`

## Required demo video / sprint evidence

- Record the required daily Scrum (five days/week); upload to team's Metropolia Drive.
- GitHub Issues: one feature/task with acceptance criteria per person.
- Show the customer both CVs with the same saved phone number and different skills.
- Note issues and customer approval in `docs/project/CUSTOMER_MEETING.md`.
- Mark live Auth and RLS checks **not verified** until they are executed against your own Supabase instance.

## Suggested issue list

1. Connect team Supabase project and redirect URLs (Member 4, Member 1 review).
2. Run two-account live isolation test (Member 4, Member 2 review).
3. Review registration/forgot-password UI including mobile sizes (Member 1, Member 4 review).
4. Add profile form validation and empty states (Member 2, Member 3 review).
5. Print A4 CV with long experience + links (Member 3, Member 1 review).
6. Record tests, user guide and customer feedback (shared).
