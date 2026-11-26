# Real deployment checklist for the CV Studio team

## One-time prerequisites

- [ ] Create a team-owned Supabase project, select region, restrict project dashboard access.
- [ ] Run `supabase/schema.sql` and verify RLS is ON for profiles and cvs.
- [ ] Set Email Auth confirmation ON and configure your permitted localhost + production redirect URL.
- [ ] Add Project URL and public publishable key to `src/config.js`.
- [ ] Confirm rate limits and reliable email delivery. For a real release, configure production SMTP.
- [ ] Use test accounts to verify login, profile saving, multiple CV creation, PDF export, logout, re-login and password reset.
- [ ] Run two-account isolation security tests (do not skip).
- [ ] Deploy a site to an HTTPS host; add its exact URL to Supabase Auth URL Configuration.
- [ ] Agree with Aino on privacy notice, retention, full Auth account deletion and incident contact before public launch.

## Four member hand-off

Member 1: Merge gate + GitHub repo and deployment; checks build and published redirect URLs.

Member 2: Profile forms, education/work history and reusable data; tests account save and re-login.

Member 3: Job-specific CVs, templates and PDF; tests isolation of CV selection and export.

Member 4: Supabase setup, RLS and authentication; owns two-account test and security checklist (reviewed by another member).

Use feature branches, issues, pull requests with reviews and recorded daily Scrum per course.

## Important

Configuring your own Supabase project is unavoidable for real authentication and cloud saving. No public page or security claim is possible from this ZIP alone. Do not put elevated secrets in client source.
