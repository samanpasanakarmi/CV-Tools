> Historical v0.4/v0.5 planning notes. For the current real cloud project, start with `README.md` and `docs/REAL_PROJECT_NEXT_STEPS.md`.

> **LEGACY NOTE (23 Oct 2026):** This document describes the original browser-only prototype. Aino has now requested logins, cloud-backed accounts, reusable profiles, and multiple CVs. For current decisions use `CUSTOMER_CONFIRMED_REQUIREMENTS.md`, `FOUR_MEMBER_SPRINT_BACKLOG.md`, and `SETUP_SUPABASE.md`.

# User guide — CV Studio

1. Run `npm start` and open <http://127.0.0.1:4173>.
2. Fill in your personal details and professional summary on the left.
3. Use **+ Add** in each section to save work, education, skills and other information.
4. Use the checkbox on each record to decide whether it appears on the current CV.
5. Use **↑ / ↓** to reorder records and **×** to remove an unwanted record.
6. Change **Layout** and **Accent** above the preview to customize appearance.
7. Click **Save as PDF**, select **Save as PDF** in the print dialog and save the file. Choose A4, and turn off browser headers and footers when available.
8. Click **Export JSON** regularly to create a full backup; **Import JSON** restores it. This replaces the current CV only after confirmation.
9. **Export TXT** creates a plain text version of only included content.
10. **Clear CV** erases current browser-stored information (export a backup first).

The CV is stored in your own browser (localStorage). This is not online storage. Do not use incognito/private mode if you need the data to persist.


### v0.5 account options

When cloud configuration is active, register and verify your email before login. Use **Forgot your password?** if needed. In **Account**, change your password, download a complete JSON backup, or erase your CV content. Erasure does not delete the login account. The demo mode uses fictional information and resets on refresh.
