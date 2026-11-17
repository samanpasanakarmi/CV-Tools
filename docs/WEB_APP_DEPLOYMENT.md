> **LEGACY NOTE (23 Oct 2026):** This document describes the original browser-only prototype. Aino has now requested logins, cloud-backed accounts, reusable profiles, and multiple CVs. For current decisions use `CUSTOMER_CONFIRMED_REQUIREMENTS.md`, `FOUR_MEMBER_SPRINT_BACKLOG.md`, and `SETUP_SUPABASE.md`.

# CV Studio: Web application setup and publishing guide

## Architecture decision for the student team

The teacher/customer explicitly allows a **web** or offline application and any technology. We are choosing a responsive, browser-based **web app** with standard HTML, CSS and JavaScript. This is a zero-dependency static frontend. Visitors can open it from a shared URL after deployment. Users' CV data is currently saved with `localStorage` on their own device, and the printable preview can be saved as PDF.

**Important:** Public web hosting is not the same as a shared database. Current CV data does **not** sync between browsers/devices or have login accounts. Verify with Aino Haavisto whether cloud accounts, persistence, profile access, one-click downloadable PDFs or accessibility standards are required. If yes, add these as GitHub Issues and plan the backend and privacy work with customer approval.

## Local development on Windows

- Install Git, Visual Studio Code and Node.js >=20.
- Open the extracted project folder in VS Code.
- Run `npm start`, then open http://127.0.0.1:4173.
- Run `npm run check` before each pull request.
- Run `npm run build` to create `dist/`, the deployable frontend.
- `dist/` is generated; don't commit it to Git. The GitHub Pages workflow rebuilds it.

## One-time GitHub Pages setup (Team Leader)

1. Agree with the customer and teacher that the project code may be published. For GitHub Free, Pages requires a **public repository**; hosted Pages sites are public. Never commit real CV data, passwords, student personal records or confidential customer documents.
2. Create the team repository (example: `cv-tool`), upload the project following `docs/GIT_TEAM_GUIDE.md`, and invite all four students.
3. In repository **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
4. Open **Actions** and check the `Deploy CV Studio website` workflow. It runs when `main` receives a push, and can also be run manually.
5. After a successful deployment, open **Settings → Pages → Visit site**. A typical URL has the pattern `https://USERNAME.github.io/REPOSITORY/`; the exact address depends on your real GitHub repository.
6. In **Settings → Environments → github-pages**, allow only `main` to deploy if these controls are available. Protect `main` and require reviewed pull requests when the repository plan permits it.

This workflow uses GitHub's official Pages upload and deploy actions. The build contains only `index.html`, `styles.css`, `src/*.js` and the favicon, not project files or documentation. The website uses relative asset paths and therefore works from a repository subdirectory on GitHub Pages.

## Four-member division of work for a hosted web application

| Member | Lead tasks | GitHub Issues | Primary areas |
| --- | --- | --- | --- |
| 1 / Team leader | Sprint coordination, UI shell, hosting, customer questions, releases | `WEB-01 Set up GitHub`, `WEB-02 Deploy website`, `WEB-03 Responsive shell` | `index.html`, `docs/`, `.github/workflows/deploy-pages.yml` |
| 2 / CV editor | Personal details, work history, education, include/exclude, edit/delete forms | `CV-01 Personal details`, `CV-02 Experience`, `CV-03 Education`, `CV-04 Entry selection` | `src/app.js` |
| 3 / CV designer | Two templates, preview, print/PDF, mobile views, accessibility checks | `DES-01 CV templates`, `DES-02 PDF`, `DES-03 Mobile layout` | `src/preview.js`, `styles.css` |
| 4 / Data/testing | Save/reload, JSON/TXT export, data validation, automated tests, browser tests | `DATA-01 Storage`, `DATA-02 Import/export`, `QA-01 Tests`, `QA-02 Acceptance` | `src/model.js`, `tests/`, `.github/workflows/ci.yml` |

All team members contribute code **and** attend recorded daily Scrum meetings. Use issues for ownership, feature branches for work, pull requests for changes, and peer reviews before merging.

## Release checklist

- [ ] Customer has reviewed requirements and the prototype.
- [ ] Feature work merged into `main` only after another member reviews it.
- [ ] `npm run check` passes and `npm run build` produces `dist/`.
- [ ] Deploy workflow passes and GitHub Pages URL loads in desktop Chrome/Edge.
- [ ] It also loads on a mobile screen and form fields are usable.
- [ ] User can add/update/delete an experience entry and select what appears in preview.
- [ ] PDF printing works at A4 size and includes only intended information.
- [ ] JSON export/import and text export work.
- [ ] Refresh retains data on the **same** browser/device.
- [ ] Demo is tested with fictional data and never commits personal CV information.
- [ ] README and user guide explain that local storage is device-bound.

## Future architecture (only after customer agrees)

If profiles and cross-device access are required, plan authentication and a database using a secure managed backend. This adds password/login handling, access control, privacy policy, consent/data deletion, backup/recovery and hosting choices. **Do not promise these features with the current static website.**
