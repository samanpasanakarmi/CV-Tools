# Deployment guide — current cloud-backed core

GitHub Pages hosts only the static frontend. Supabase handles accounts and cloud data. A local application working is not proof of public deployment or security.

## Before publishing

Agree with the customer/teacher on public source and demonstration access. Complete [live security verification](../testing/SECURITY_TESTS.md) and privacy review before inviting real users. Review repository examples and screenshots for private data. Use disposable test accounts for staging.

1. Configure the team Supabase project, apply the core schema and configure email/redirect URLs as in [SETUP_SUPABASE.md](SETUP_SUPABASE.md).
2. Run npm run check and npm run build.
3. Repository Settings → Pages → Build and deployment → Source: GitHub Actions.
4. In Actions, run **Deploy CV Studio website** (or use its next main push). Confirm build, artifact upload and deployment all succeed.
5. Use the exact URL shown under Settings → Pages. Add it to the Supabase Auth Site URL / allowed redirects as appropriate.
6. Verify HTTPS, login/email recovery, saves, logout, desktop/mobile and PDF exports using test accounts.
7. Record results and have the team/customer approve the intended delivery.

The [25 November deployment run](https://github.com/samanpasanakarmi/CV-Tools/actions/runs/45677502125) built and uploaded successfully but deployment failed. Do not advertise a live URL before confirmation.

## Operating controls

Use a reviewed main branch, restrict deployment and admin permissions, do not commit dist/ or elevated keys, and keep private test data out of public assets. Production SMTP, Auth rate limits, privacy notice and retention are team/customer responsibilities. AI is outside core deployment; do not deploy or enable it just to publish the frontend.
