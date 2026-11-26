# Code walkthrough for developers and reviewers

CV Studio uses browser-native JavaScript modules. No framework, bundler or new dependency is needed. Start at [app.js](../../src/app.js): it registers the feature controllers and then starts the session.

## Find the right file

| Area | File | Responsibility |
| --- | --- | --- |
| Startup | [app.js](../../src/app.js) | Registers features in the original order and calls boot |
| Shared workspace | [state.js](../../src/state.js) | In-memory API, profile, CVs, active screen, dirty flags and disabled AI flag |
| Authentication | [controllers/auth.js](../../src/controllers/auth.js) | Login, signup, recovery, logout and initial data load |
| Navigation | [controllers/navigation.js](../../src/controllers/navigation.js) | Save before moving between screens |
| Profile editing | [controllers/profile.js](../../src/controllers/profile.js) | Input events, entry actions and photo upload |
| CV editing | [controllers/cvs.js](../../src/controllers/cvs.js) | Create/duplicate/delete, selections, custom fields and ordering |
| Saving | [controllers/saving.js](../../src/controllers/saving.js) | Cloud snapshot saves, status and private state cleanup |
| Account settings | [controllers/account.js](../../src/controllers/account.js) | Password changes, backup and data erasure |
| Export | [controllers/export.js](../../src/controllers/export.js) | PDF/TXT/JSON and unsaved-change warning |
| Views | [ui/](../../src/ui/) | Screen markup and rendering; event handlers live in controllers |
| Photo | [photo.js](../../src/photo.js) | Validate and resize images |
| Shared data model | [model.js](../../src/model.js), [model/](../../src/model/), [workspace.js](../../src/workspace.js) | Public model interface, focused model helpers, composition and autosave queue |
| CV output | [preview.js](../../src/preview.js) | Printable HTML preview |
| Cloud connection | [api.js](../../src/api.js), [api/](../../src/api/), [auth-flow.js](../../src/auth-flow.js) | Public CloudApi class, focused request/session/data helpers and safe callback parsing |
| Experimental AI | [controllers/ai.js](../../src/controllers/ai.js), [ui/ai-view.js](../../src/ui/ai-view.js) | Disabled feature; no AI call in core |

## Model and API modules

The root model.js and api.js are intentionally small public interfaces. Existing imports and method calls still work. Follow the files below for the actual implementation.

| Model module | Responsibility |
| --- | --- |
| [constants.js](../../src/model/constants.js) | CV field definitions and templates |
| [validation.js](../../src/model/validation.js) | Date and work history validation |
| [safety.js](../../src/model/safety.js) | HTML escaping, image and link validation |
| [ids.js](../../src/model/ids.js) | Record identifiers |
| [custom-fields.js](../../src/model/custom-fields.js) | Custom field limits and normalization |
| [section-order.js](../../src/model/section-order.js) | Section order and two-column grouping |
| [profile.js](../../src/model/profile.js) | Blank CV and normalized documents |
| [entries.js](../../src/model/entries.js) | Entry creation, movement and selection |
| [sample.js](../../src/model/sample.js) | Fictional sample for existing tests |
| [text-export.js](../../src/model/text-export.js) | Plain text CV generation |

| API module | Responsibility |
| --- | --- |
| [request.js](../../src/api/request.js) | HTTP requests, headers, timeout and errors |
| [session.js](../../src/api/session.js) | Session refresh, logout and stale-response checks |
| [authentication.js](../../src/api/authentication.js) | Registration, login and password flows |
| [profile-data.js](../../src/api/profile-data.js) | Profile reads, writes and workspace erasure |
| [cv-data.js](../../src/api/cv-data.js) | CV create, read, update and delete |
| [ai-data.js](../../src/api/ai-data.js) | Experimental AI endpoint request |

All API helpers receive the same CloudApi object. This keeps the access token, refresh promise and session generation in one place rather than creating independent copies. Requests, paths, authorization, timeouts and database payloads are unchanged. Do not persist credentials in browser storage or bypass owner-only RLS.

## Follow one edit

1. A profile input fires an event registered in controllers/profile.js.
2. The controller modifies the in-memory master profile and calls markDirty.
3. ui/render.js composes a preview using the existing data model.
4. controllers/saving.js schedules the existing workspace autosave queue.
5. api.js sends the authenticated snapshot to Supabase.
6. The save indicator changes only after the write result is known.

## Styling

[styles.css](../../styles.css) imports [styles/](../../styles/) in the original cascade order: base UI, resume/print, workspace, account, editor controls, template rules, disabled AI screens, additional templates and feedback. Each CSS declaration has its own line. Keep import order when editing styles because later rules override earlier ones.

## Build and verification

[scripts/public-files.mjs](../../scripts/public-files.mjs) is the explicit allowlist used by both the local server and build. Add any new browser module or stylesheet there; never add private documents, tests, or secret files.

Run npm run check and npm run build. The tests verify static asset availability, the module graph, and a simulated core UI journey in addition to existing model/API tests. Live browser, print rendering and Supabase behavior still need manual acceptance testing.

This refactor is intended to preserve functionality and data contracts. It does not redesign the application, change database policies, or enable AI. See [architecture](ARCHITECTURE.md) and [test plan](../testing/TEST_PLAN.md).
