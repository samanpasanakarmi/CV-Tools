> **LEGACY NOTE (23 Oct 2026):** This document describes the original browser-only prototype. Aino has now requested logins, cloud-backed accounts, reusable profiles, and multiple CVs. For current decisions use `CUSTOMER_CONFIRMED_REQUIREMENTS.md`, `FOUR_MEMBER_SPRINT_BACKLOG.md`, and `SETUP_SUPABASE.md`.

# CV Tool verification and QA

## Automated checks
Run `npm run check` after every meaningful change and before every PR; GitHub Actions repeats these checks.

Initial tests cover blank defaults, ordering, normalized JSON import, excluding entries, escaping user input, unsafe URL handling, duplicate IDs, and JSON round-trip.

## Manual end-to-end test — use **fictional** example data

| Test | Steps | Expected result | Tester/date |
| --- | --- | --- | --- |
| First run | Load app; click Load example | Example CV appears, two-column editor/preview available | |
| Edit profile | Change name/title/email | Preview updates instantly | |
| Add record | Add experience; enter all fields | Job appears in preview | |
| Include/exclude | Uncheck experience checkbox | Job vanishes from preview but stays in editor | |
| Reorder | Add second job; use arrow buttons | Order changes correctly | |
| Delete | Remove an entry and confirm | Entry disappears | |
| Persist | Refresh page | Entered information remains | |
| JSON export/import | Export JSON; clear; import JSON | Original complete CV is restored, including excluded entries | |
| TXT export | Export TXT | All included sections appear; hidden entries absent | |
| PDF | Click Save as PDF; Chrome/Edge Save as PDF | A4 CV only; no editor/sidebar; printable | |
| Template | Switch Modern/Classic; change color | Layout/heading styles update without losing data | |
| Unsafe import | Try invalid JSON and v2 JSON | Friendly error, current CV preserved | |
| Narrow browser | Resize to phone-like width | Forms remain usable; no important controls missing | |
| Keyboard | Use Tab/Shift+Tab | All inputs, buttons and select are reachable | |

## Known limitations / future backlog
- Stored in one browser via localStorage only. No multi-device sync.
- The initial PDF workflow uses browser print, so output appearance can vary by browser/OS.
- No multiple saved CV variants, authentication, custom section names, drag-and-drop, PDF page numbering or direct DOCX export.
- A long CV needs manual printing/page-break checks.
- No independent end-to-end browser automation included in this starter.
- Accessibility and real customer acceptance have not yet been independently confirmed.

## Privacy and handover
- Do not upload personal resumes or students' private details to GitHub.
- Screen recordings must use invented data and follow school consent/privacy requirements.
- Include actual requirements, feature overview, system requirements and user manual at final delivery.
- The final customer deliverable format must be **agreed with the customer**.
