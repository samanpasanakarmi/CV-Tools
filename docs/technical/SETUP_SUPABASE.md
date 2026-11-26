# CV Studio v0.5 — connect the complete cloud workflow

## 1. Prepare your team-owned Supabase project

- Sign in at https://supabase.com/dashboard/ and create a separate project dedicated to this course.
- Choose the appropriate EU region with your customer and record who manages access to the project.
- Supabase **SQL Editor** → paste and execute `supabase/schema.sql` (includes `profiles`, `cvs`, owner-only RLS, and a CV-data erase RPC).
- **Authentication → Providers → Email**: enable email/password authentication and **email confirmation**. Apply strong password settings and rate limiting as appropriate. For production configure your own SMTP email sender (the trial service is limited).
- **Authentication → URL Configuration**: set the Site URL to your published HTTPS website and add explicit redirect allowlist URLs:
  - `http://127.0.0.1:4173/` (local developer server)
  - `http://localhost:4173/` if you actually use localhost
  - `https://YOUR-GITHUB-USER.github.io/YOUR-REPOSITORY/` (GitHub Pages, or your own domain)
- Email confirmation and recovery callbacks should redirect to exactly your application's permitted URL. See https://supabase.com/docs/guides/auth/redirect-urls .

## 2. Add only public keys

Supabase **Connect** panel → Project URL and publishable key. Change `src/config.js` to:

```js
export const CLOUD_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'sb_publishable_YOUR_PUBLIC_KEY'
};
```

Never use `sb_secret_...`, the old `service_role` JWT, a database password, or admin credentials in browser code. The public key alone does **not** protect data; SQL grants plus RLS policies do.

## 3. Start and test locally

```bash
npm start
```

Open http://127.0.0.1:4173/ and verify:

1. Register with a disposable email and a strong password.
2. Click the verification link sent by Supabase. On return to the app, the link tokens are removed from the address bar and the session is verified.
3. Add name, contact details, experience and skills to **My Profile** and click **Save my profile**.
4. Create CV 1 (job A) and CV 2 (job B); select different skills/experience. Save each.
5. Log out, log in again, and verify both CVs and the shared profile remain.
6. Click **Forgot your password?**, request a link, set a new password, and log in again.
7. From **Account**, change your password and download a full JSON backup. Be careful: backup contains private data.
8. Run the live isolation test using two **other, disposable, empty accounts** as described in `docs/testing/SECURITY_TESTS.md`.
9. Test the erase flow with disposable accounts only. It removes CV content and profile, **not login identity**.

## 4. Deployment

Run `npm run check` and `npm run build`, then publish `dist/` on an HTTPS static website. GitHub Actions for Pages is included under `.github/workflows/deploy-pages.yml`. In repository **Settings → Pages**, choose **GitHub Actions** as the publishing source and confirm the Pages URL is in your Supabase Auth redirect allowlist.

For a private repository on a plan that doesn't allow Pages publication, use a supported static host instead or adjust your team's repository visibility with instructor approval.

## Important limits before real release

- No real Supabase backend is included in the ZIP. Your team must create it and test email redirects + security policies.
- Backend email account throttles and a production SMTP setup belong to your project's configuration.
- The prototype intentionally uses browser-memory-only credentials. A page refresh asks the user to sign in again; this is **not persistent login**.
- No full Auth account deletion, privacy notice, customer-approved retention/deletion process or penetration test in this version. Do not claim GDPR-compliant or secure-for-public-use without completing those tasks.
- Supabase Auth's implicit-flow links are used here because this project uses a static client-side application. A production system may benefit from the official Supabase JS SDK and PKCE/backend authentication architecture.
