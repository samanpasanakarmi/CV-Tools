> Historical v0.4/v0.5 planning notes. For the current real cloud project, start with `README.md` and `docs/archive/REAL_PROJECT_NEXT_STEPS.md`.

# CV Studio v0.4 — Upgrade notes

## Built from the older v0.3 project

No rewrite: v0.3's data model, master profile editor, CV renderer, Supabase Auth client, RLS schema, GitHub Actions CI and static deployment were preserved.

New in v0.4:
1. Fully interactive **fictional demo** without a Supabase account, with clear warnings and reset button.
2. **Overview dashboard** with recent CVs, reusable item counts and one-click navigation.
3. Two different **sample applications** (Nokia, Finnair) for demonstrating how one profile produces different CV versions.
4. **Create-new-CV form** with CV name, target company and role; no browser prompt for creation.
5. **Per-CV contact visibility** (email, phone, address, location, website), independent between CVs.
6. Refined **duplicate/edit/delete** experience and descriptive export filenames.
7. **Single-file offline demo** for customer meetings (`CV-Studio-Offline-Demo.html`).
8. New automated unit tests for demo and contact selection.

## Five-minute demo for Aino

1. Open `CV-Studio-Offline-Demo.html` and select **Explore sample demo instead**.
2. Show **Overview → My Profile**. The name, address, phone, education and experience are entered only once.
3. Open **My CVs → Software Developer — Nokia** and show relevant experience, skills and live PDF preview.
4. Open **Customer Service — Finnair** and show the same phone and name but different role, summary, skills, experience and template.
5. Create a new CV with a company and job title. Hide contact fields, choose experience and **Save PDF** (browser print dialog).

This demonstration **does not create a real account** or save personal data to the cloud. It is distinct from the backend-enabled site. Do not enter personal data in demo mode.

## Immediate backlog

- Configure a team-owned Supabase project and apply/test RLS with two fictional accounts.
- Confirm with Aino whether edits to master data should update all existing CVs or if some CVs should be frozen for historical job applications.
- Confirm export formats besides PDF and required languages/templates.
- Implement password recovery, account deletion and full privacy notice before considering any public use with personal data.
