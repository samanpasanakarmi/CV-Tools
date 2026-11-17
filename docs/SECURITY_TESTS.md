# CV Studio v0.5 — secure cloud checklist

**Never test with real CV data.** The automated Node tests mock the remote Auth/Data API; they do not verify the actual Supabase project. The customer must approve the privacy arrangements before public use.

## 1. Configure the Supabase project

- Apply `supabase/schema.sql` from the repository to your Supabase project's SQL Editor.
- Enable email + password login and email confirmation. Configure the published site URL and allowed callback URLs.
- Do not use a secret/service-role key in any browser, repository or published site.
- Enable MFA for administrative Supabase accounts. Restrict who can edit SQL and API settings.
- Deploy on HTTPS and check Auth/email redirects work from your real domain.

## 2. Two-account isolation test (MANDATORY, live)

Create **two disposable, empty, verified test accounts** in the app. Their data WILL be erased by this test. Never use your regular account. On your own computer, set these variables privately (PowerShell example):

```powershell
$env:CV_STUDIO_SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co'
$env:CV_STUDIO_PUBLIC_KEY = 'sb_publishable_YOUR-KEY'
$env:CV_STUDIO_TEST_EMAIL_A = 'disposable-A@example.com'
$env:CV_STUDIO_TEST_PASSWORD_A = 'type-your-private-test-password'
$env:CV_STUDIO_TEST_EMAIL_B = 'disposable-B@example.com'
$env:CV_STUDIO_TEST_PASSWORD_B = 'type-your-private-test-password'
$env:CV_STUDIO_TEST_MODE = 'I_UNDERSTAND'
node tests/live-two-account-check.mjs
```

**The script explicitly refuses to run without opt-in and empty disposable accounts.** It checks:

1. Both users sign in and are different accounts.
2. A creates synthetic profile/CV; only A can see them.
3. B cannot fetch A's profile/CV directly using its identifiers.
4. B cannot create a row owned by A, or update/delete A's CV.
5. A logs out, logs back in and finds saved data.
6. A's synthetic CV and profile are cleared afterward.

If any check fails, **stop immediately**. Do not publish or store genuine personal data. Investigate SQL grants, RLS policies and auth settings. Do not bypass RLS as a quick fix.

## 3. Manual account-flow tests

- Register new email and verify using confirmation email. Log in and log out.
- Use **Forgot your password**: request link, open recovery email, choose new password, log in again.
- In **Account** change password, log out, verify the new password works.
- Save a profile, create two CVs. Change a phone number and verify the new number appears in both; changing CV-specific experience selections must not affect other CVs.
- Duplicate an existing CV, customize and save. Confirm a second account cannot access any of it.
- Export a complete backup and verify its file contains a profile and all CVs. Treat it as personal data and store privately.
- Use the erase action on a **disposable account** and verify profile + CV rows are gone. The Auth account still exists.
- Test account flows on HTTPS desktop/mobile after deployment, including email redirect URLs. Never enable live data without customer acceptance.

## 4. Explicit limitations

- No backend production penetration test was conducted. Tests are code-level plus demo browser checks until your team runs the live checklist.
- Sessions are memory-only, so refreshing the website requires login; this is a security/convenience tradeoff for the student prototype.
- Account **deletion** (removing the Supabase Auth identity), GDPR privacy notice, retention process, support and incident response are not implemented. The erase action removes application CV content only.
- The browser PDF feature uses native Print → Save as PDF, not a server-side PDF service.
- Browser code uses the Supabase implicit client flow; reassess for a production deployment with a trained security reviewer. Consider official Supabase SDK, PKCE and a backend/BFF if needed.

Official documentation: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/auth/passwords
