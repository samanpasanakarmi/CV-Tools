> Historical v0.4/v0.5 planning notes. For the current real cloud project, start with `README.md` and `docs/archive/REAL_PROJECT_NEXT_STEPS.md`.

# v0.5 release notes

Based on v0.4 (all existing CV form/preview/data reuse features retained).

- Completed client-only email confirmation link handling (`#access_token` / `#refresh_token`) and validated the returned user against Supabase Auth before trusting the callback.
- Added forgot-password email flow, recovery link processing and new-password form.
- Added Account panel with password change, full JSON backup, and permanently erasing profile + CV data. Erase does **not** remove the login account.
- Added database `clear_my_cv_data()` RPC with SECURITY INVOKER and owner-only RLS. Updated timestamps now refresh when records change.
- Added live two-account test utility (run only on your own disposable Supabase test accounts), mocked authentication tests, and project documentation.
- Keeps demo mode and standalone HTML demonstration without requiring Supabase, with fictional data only.
- Prevents stale user data from being displayed when signing in but loading the cloud workspace fails.
- Original v0.4 CV layout, reusable profile, experience selectors, duplication, PDF/TXT/JSON exports, GitHub collaboration files remain.

### Not provided in v0.5

- Real project credentials, live Supabase project, hosted website, security certification or public production launch.
- Fully delete an Auth account / user identity, privacy notice, operational GDPR arrangements.
- Tested production password reset or RLS isolation: your team must apply SQL and run tests against its own instance.
