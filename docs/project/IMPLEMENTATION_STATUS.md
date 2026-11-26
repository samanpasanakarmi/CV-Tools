# Implementation status — 26 November 2026

Current baseline: main commit 2a4965c87f049c28bca189258528223f9dcd3b65. Earlier implementation status is retained in Git history; see [changelog](../../CHANGELOG.md) for milestones.

## Implemented in source

- Real Supabase Auth and cloud-backed master profile / multiple CVs.
- Nine templates, exact work dates, optional photo, CV-specific selections and contact visibility.
- Browser PDF, TXT, JSON and full data backup; profile/CV erasure.
- Core hardening, serialized autosave and status, custom fields, per-CV section order.
- Experimental AI code retained but core UI disabled; supplied backend defaults to disabled.

## Verified evidence

57 automated tests passed on main on 25 November; production build and artifact upload passed, Pages deployment failed. See [TEST_RESULTS.md](../testing/TEST_RESULTS.md). Local success has been reported for the application and autosave/custom fields, without a complete recorded manual run.

## Outstanding release gates

- Live two-account isolation, authentication/email checks and server-side data limits.
- Full account deletion, agreed privacy notice, retention, ownership and incident process.
- Public HTTPS deployment and redirect configuration.
- Current PDF, mobile, keyboard/accessibility and cross-browser acceptance.
- Customer approval and real team contribution records.
- Review public repository examples and historical evidence for privacy.
- Branch protection / peer review, release tag and delivery ownership.

## Known limits

No offline persistence, concurrent-device conflict resolution, JSON restore, guaranteed ATS compatibility or public-use security certification. Refresh requires login. AI provider calls are not verified and remain outside core delivery.
