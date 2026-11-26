# Current test plan — CV Studio core

Use fictional personal information and disposable accounts. Test the exact commit, browser, OS and Supabase environment intended for delivery. Record actual results in [TEST_RESULTS.md](TEST_RESULTS.md); a planned test is not a passed test.

## Automated regression

Run npm run check and npm run build. CI runs the Node tests on Node 22. These cover model normalization, escaping, dates, auth/API mocks, CV composition, templates, local-server access, autosave and custom section ordering. They do not prove live Supabase security or real PDF layout.

## Manual acceptance cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| M01 | Register, confirm email, sign in, wrong password | Valid account works; wrong password rejected |
| M02 | Recover / change password | New password works; old password rejected |
| M03 | Enter profile, experience dates, optional photo, save, sign out/in | Saved data retained; photo only on allowed templates |
| M04 | Create two CVs; choose different entries and contacts; edit shared profile | Independent selections; shared profile changes appear in both |
| M05 | Duplicate and delete one CV | Copy independent; only selected CV deleted |
| M06 | Type, pause, type during save, reload after saved status | Latest confirmed changes persisted |
| M07 | Invalid date / empty CV title; offline save; reconnect and Save now | Not-saved state; no false success; retry persists valid data |
| M08 | Add/edit/remove custom fields; duplicate CV | Complete fields rendered; blank omitted; copy independent |
| M09 | Reorder standard/custom sections; reset; switch templates | Preview and export follow order; two-column groups preserved |
| M10 | All nine templates; A4 one- and multi-page PDF | Readable output; no editor controls, clipping or unexpected blank pages |
| M11 | TXT, JSON, full account backup | Expected included content and order; backup includes all saved data |
| M12 | Mobile viewport and keyboard navigation | Controls usable, focus visible, no inaccessible actions |
| M13 | Logout during/after save, refresh, second account | No previous private data visible; session requires login after refresh |
| M14 | Erase profile/CVs on disposable account | Profile and CVs removed; Auth identity remains |
| M15 | Live two-account isolation script | All cross-account read/write/delete attempts rejected |
| M16 | HTTPS staging URL, email redirects, desktop/mobile browsers | Deployment and configured authentication work |

M15: follow [SECURITY_TESTS.md](SECURITY_TESTS.md), including its destructive-test safeguards. Do not run against real accounts.

## Release gates

CI and build pass, M01–M16 evidenced or explicitly resolved, privacy and security risks addressed, customer acceptance and team review recorded. Browser PDF page breaks and accessibility require real testing; do not infer them from DOM markup tests.
