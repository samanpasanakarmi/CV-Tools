# CV Studio — roles, tasks, GitHub Issues and sprint plan

## Responsibilities (everyone codes and reviews)

| Member | Primary workstream | Feature branches to create | Review partner |
|---|---|---|---|
| Member 1 (Scrum Master + integrator) | Customer communication, website navigation, GitHub project, CI and releases | `feature/navigation`, `docs/customer-requirements` | Member 4 |
| Member 2 (Master profile) | Profile form, work/education/skills CRUD, link master data to CVs | `feature/master-profile` | Member 3 |
| Member 3 (Tailored CVs + PDF) | CV creation/duplicate/edit, per-CV selection, templates, PDF/TXT/JSON export | `feature/tailored-cvs` | Member 2 |
| Member 4 (Security + QA) | Signup/login, SQL RLS, negative access tests, test automation, privacy checklist | `feature/auth-security`, `test/rls-negative` | Member 1 |

Repository ownership is shared, not exclusive. Every code change needs someone else's PR review. Nobody pushes unfinished features straight to `main`. Rotate the Scrum Master if the team wants equal process experience.

## Create GitHub Issues

- [ ] #1 Decide sprint goal and create customer requirements acceptance checklist (M1 with all)
- [ ] #2 User journey map (M2 with M3)
- [ ] #3 HMW notes from all four, cluster and vote (M3 facilitator)
- [ ] #4 Risk register + mitigation decisions (M4 with all)
- [ ] #5 GitHub repository / board / branch protection / CI (M1)
- [ ] #6 Figma registration/dashboard/profile/CV editor/PDF prototype (M2, M3)
- [ ] #7 Customer test plan and design sprint review invitation (M1, M4)
- [ ] #8 Cloud Auth and safe client configuration (M4, Dev Sprint 1)
- [ ] #9 Reusable profile CRUD (M2, Dev Sprint 1)
- [ ] #10 Several saved CV drafts + duplicate/select items (M3, Dev Sprint 1)
- [ ] #11 SQL RLS grants/policies and cross-user negative tests (M4, Dev Sprint 1)
- [ ] #12 Integration, responsive UI and export tests (M1 + all, Dev Sprint 2)
- [ ] #13 Privacy/account deletion and customer sign-off gate (M1, M4, Dev Sprint 2)
- [ ] #14 Final docs, video, presentation and peer review (all)

## Course deadlines

- **8 November**: design sprint prototype and customer feedback; submit prototype in OMA.
- **22 November**: working MVP and GitHub repository link in OMA.
- **5 December**: second development sprint final application and GitHub link in OMA.
- **13 December**: final application, deployment/delivery, software requirements, feature guide, user guide, self/peer review, presentation and project process documentation.

## Definition of Done for each GitHub Issue

- Acceptance criteria are written and addressed.
- Feature runs, automated tests pass, no personal test CV committed.
- At least one reviewer other than author approves PR.
- Screenshots contain fictitious data only.
- Customer-facing scope/security changes are documented.
- The issue and GitHub Project status updated after merge.

## Team coordination

Daily 15-minute recorded Scrum five days/week. Each member says what they did, what they will do, blockers. Upload video to your team's Metropolia Google Drive. Keep technical debugging for after Scrum. Customer review before 8 Nov, and schedule that during the kickoff. End every sprint with demo + feedback and a short retrospective.
