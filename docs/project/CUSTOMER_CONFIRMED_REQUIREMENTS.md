# CV Studio — customer requirement update (23 October 2026)

Customer: **Aino Haavisto, Metropolia**. The requirements here reflect what the team reported after its kickoff meeting. The team should send these notes to the customer for confirmation; they are not a signed-off contract.

## Confirmed in the team's account of the meeting

1. Must be a **web-based application**.
2. Users can create an account and **log in**.
3. Users can keep reusable **personal details** (e.g. name, address and phone number), so they are not required to type them again when preparing additional CVs.
4. Users can make **multiple customized CVs** for different employers/positions and reuse information from previous CVs.
5. The website must be **secure**, keeping personal information private.

## Original course brief requirements
- Store work history and other CV information.
- Convert information into a visually attractive **PDF CV**.
- Manage stored data and choose which parts appear in a CV.
- **Export in formats other than PDF**.

## Proposed product acceptance criteria (confirm with customer)

- A new user can register, verify email and sign in.
- A user can enter name/email/phone/address/education/work once and save a **master profile**.
- A user can create CV-A for Employer A, and CV-B for Employer B. Both pull personal details from the saved master profile.
- Changes to shared name/phone/address should appear in both CV previews. Each CV can have a different headline, summary, chosen experience/skills, style, company and job title.
- A user can log out, log back in on another device and see their information (after deployment and real database configuration).
- A user can save separate drafts and export PDF/JSON/TXT.
- User B cannot view, update or delete User A's private profile or CVs (verify via RLS tests, including API requests).

## Open decisions to ask Aino

- Can edits to common profile fields update *all* existing CVs immediately, or should each saved CV freeze a historical copy? Proposed: automatically updated shared personal fields; per-CV customizations stay independent.
- More templates and some with optional photos were requested in the November 6 feedback; see `CUSTOMER_FEEDBACK_V06.md`. Address remains optional.
- Is PDF via browser Print/Save as PDF sufficient, or is downloadable one-click PDF required?
- Which additional export format(s) does the customer want (DOCX, JSON, TXT, LinkedIn-friendly plain text)? Current web application: JSON and TXT.
- Should users log in with email/password only, or also Microsoft account?
- Where should EU personal data be hosted? Who is the controller, and what retention/deletion/privacy notice rules apply?
- Are shareable CV URLs, job description matching, cover letters, password reset and MFA needed in later sprints?

## User journey

Visitor → Register / Verify email → Sign in → **My Profile** (store once) → **My CVs** → New CV → Select company/role → Reuse profile and select work/skills → Preview → Save and export → Later sign in → Duplicate/modify for another company.

## Initial HMW notes

- How might we prevent users from retyping basic information for every job application?
- How might we let users tailor experience and skills independently for each employer?
- How might we make sensitive CV information private even when another user knows a CV ID?
- How might we make it obvious which details are shared and which are CV-specific?
- How might we keep exported PDFs attractive across devices?
- How might we give users understandable controls for editing, exporting, and deleting their data?

## Risk exercise — "If we fail to reach the goal, why?"

- Account access rules are incomplete → Implement/test RLS before sharing with real people.
- Reusable master information and CV snapshots become inconsistent → Define one data model and write unit tests.
- Team works on same files and merges conflicting changes → Use GitHub Issues, branches, pull requests and shared contracts.
- Authentication and database configuration take longer than planned → Demonstrate design prototype first, configure hosted services in Dev Sprint 1.
- PDF looks different in various browsers → Test common browser/print combinations early.
- Missing GDPR arrangements delay release → Discuss privacy responsibilities, hosting region, retention and deletion early.
