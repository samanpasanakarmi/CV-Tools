# Core security hardening (draft)
This branch keeps the manual CV builder and preserves AI source code. AI navigation is disabled and the revised Edge Function fails closed unless AI_ENABLED=true. This does not change any existing deployed function: leave it undeployed or remove its OpenAI secret until the team is ready.
 
Changes: private workspace cleanup on logout and CV-data erasure; interaction lock during saves and photo processing; stale refresh rejection; bounded client request timeout; development server public-file allowlist; baseline meta CSP; Node 20 build compatibility; regression tests.
 
Before merging: review and run CI; manually test login, logout, account erasure, profile/photo saving, all nine templates, exports and password recovery; perform disposable two-account live RLS tests. Meta CSP allows HTTPS Supabase subdomains, inline styles for CV rendering, and local/data/blob images; test with your actual hosting setup. Use HTTP security headers where available. Full account deletion, database storage quotas, privacy notice and production readiness remain separate tasks. No production database migration or deployment is performed here.
