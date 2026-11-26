# Changelog

This is a retrospective development history, not a list of published GitHub Releases or verified historical tags. The package version was still 0.7.0 when this document was prepared; the core milestone labels below describe development work, not a version bump.

## Unreleased — documentation and project readiness

- Updated current project, architecture, requirements, user, deployment and verification guides.
- Preserved historical project records and identified pending acceptance/security tasks.

## Core customization milestone — 25 November 2026

- [PR #4](https://github.com/samanpasanakarmi/CV-Tools/pull/4): per-CV section ordering, reset, legacy compatibility, template-aware ordering and export consistency.
- [PR #3](https://github.com/samanpasanakarmi/CV-Tools/pull/3): automatic saving, save-status indicators, manual retry and custom CV fields.
- [PR #2](https://github.com/samanpasanakarmi/CV-Tools/pull/2): logout/session hardening, local static-server restrictions, CSP baseline, AI disabled in core, Node build compatibility.
- [PR #1](https://github.com/samanpasanakarmi/CV-Tools/pull/1): three additional templates, total nine.
- Main CI: 57 tests passed; deployment failed after successful build/artifact upload.

## v0.7 — experimental AI (historical)

AI tailoring code and consent/review flow added; actual live provider calls not verified. Core UI subsequently disabled.

## v0.6 — customer feedback (historical)

Exact work dates, simplified dashboard, six templates and optional photo support.

## v0.5 — authenticated account management (historical)

Email recovery/password change, full backup export and CV-content erasure. See docs/WHAT_CHANGED_V05.md.

## v0.4 — cloud workspace (historical)

Reusable profile, multiple tailored CVs and Supabase API/data model. See docs/WHAT_CHANGED_V04.md.

Earlier version labels reflect existing repository documentation. Confirm tag targets and customer approval before publishing a release.
