# Verification evidence

## Recorded automated results

| Date (UTC) | Scope | Result | Evidence |
| --- | --- | --- | --- |
| 2026-11-25 | Core security PR #2, merged main | 47/47 pass | [CI run](https://github.com/samanpasanakarmi/CV-Tools/actions/runs/45627342406) |
| 2026-11-25 | Autosave/custom fields PR #3 | 52/52 pass | [CI run](https://github.com/samanpasanakarmi/CV-Tools/actions/runs/45673840150) |
| 2026-11-25 | Section ordering merged main, commit 2a4965c | 57/57 pass, 0 failed/skipped | [CI run](https://github.com/samanpasanakarmi/CV-Tools/actions/runs/45677502259) |
| 2026-11-25 | Production build and artifact upload | Pass; Pages deploy failed | [Deployment run](https://github.com/samanpasanakarmi/CV-Tools/actions/runs/45677502125) |

A developer reported that the local application and autosave/custom fields worked. This is an informal report, not a detailed independently reproduced acceptance run. No live isolation or PDF/accessibility pass is inferred.

## Manual results register

Complete during genuine testing. Do not commit screenshots containing real personal data.

| Test IDs | Tester | Date / commit | Browser / environment | Actual result | Status / evidence |
| --- | --- | --- | --- | --- | --- |
| M01–M05 | — | — | — | Not recorded | Pending |
| M06–M08 | — | — | — | Informal local success reported for autosave/custom fields; individual cases not recorded | Pending formal record |
| M09–M12 | — | — | — | Not recorded | Pending |
| M13–M16 | — | — | — | Not recorded | Pending |

Use one row per executed case when recording results. Link a bug issue for failures, include retest commit/date and redact private data. Keep actual credentials and confidential evidence outside the public repository.

## Interpretation

Automated source and mock API tests are not live integration or security tests. A successful build is not a successful deployment. Customer acceptance is not yet recorded here.
