# Automatic saving and CV-specific custom fields
Core-only feature branch; AI remains disabled.
 
My Profile and existing CV edits save to Supabase after 1.5 seconds without another edit. Save now remains available. The indicator distinguishes unsaved, saving, saved, validation-blocked and network-error states. Saves are serialized; a completed request does not overwrite newer typing. Leaving an editor or signing out attempts to flush changes first; if saving fails, the user can stay or explicitly discard. Browser close/reload retains the existing unsaved-changes warning; there is no local offline storage. Network errors require an edit or manual retry. Multiple simultaneous tabs/devices still use last-write-wins; conflict resolution is not implemented.
 
Custom fields are per-CV heading + multiline text, up to 20 fields, 80 characters per heading and 2,000 per value. Incomplete fields are retained in saved drafts but omitted from rendered CV and text export. PDF uses the same escaped preview; JSON exports retain field data. Duplication copies fields; old CVs default to an empty array. Existing JSONB columns support this without a SQL migration; server-side quotas remain separate work.
 
Manual verification: use disposable accounts; edit profile and CV, wait for saved status, refresh/sign in again, confirm persistence; test invalid dates, offline/retry, typing during save, navigation/logout while pending, and custom fields across all nine templates, duplication, PDF/TXT/JSON and account backup. Do not merge until CI and browser checks pass.
