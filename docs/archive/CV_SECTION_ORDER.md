# Per-CV section ordering

Each saved CV has an optional sectionOrder array in its JSON document. Existing CVs default to Profile, Work experience, Education, Projects, Skills, Languages, Certifications, then custom fields in creation order. New custom fields append and removed fields disappear from the order. Unknown and duplicate keys are ignored. The master profile is not changed.

The editor provides keyboard-accessible up/down buttons and Reset order. Name and contact details remain at the top. Empty or excluded sections are not rendered. All nine templates use the chosen order, including browser PDF output; TXT follows the same reading sequence and JSON retains sectionOrder. Modern Two Column keeps skills, languages and certifications in its existing sidebar; other sections stay in the main column. Its controls reorder within each column and TXT reads sidebar first. Other templates use the full order.

No database migration, new API or AI change. Existing cloud autosave persists the order. Duplicate CVs copy the order independently. Cross-device concurrent edit conflict resolution remains out of scope.

Manual acceptance: reorder education and experience; move a custom section above standard sections; verify preview, PDF, TXT and JSON; refresh and sign in again; verify duplicated CV order is independent; test removal/addition/reset; switch all templates and check two-column groups; use keyboard arrows/buttons and verify focus. Do not merge until CI and browser checks pass.
