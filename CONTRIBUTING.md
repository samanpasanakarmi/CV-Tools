# Contributing to CV Studio

This is a four-member student project. Discuss scope and shared data-model changes with the team. Use genuine individual work and review records; disclose AI assistance in accordance with course rules.

1. Choose a real [issue](https://github.com/samanpasanakarmi/CV-Tools/issues), agree ownership and acceptance criteria.
2. Start from current main: git switch main, git pull origin main.
3. Create a descriptive branch: git switch -c feature/short-description (or fix/, docs/).
4. Make focused commits with meaningful messages. Do not commit credentials, personal data, generated dist/ or confidential course evidence.
5. Run npm run check and npm run build. Test changes with fictional data.
6. Push your branch and open a PR with linked issue, description, actual test evidence and known limitations.
7. Request at least one teammate review. Resolve feedback and merge only after required checks pass and manual verification is sufficient for the change.

## Definition of done

Acceptance criteria met; relevant tests and build pass; user-facing behavior documented; privacy/security implications checked; evidence recorded; teammate review completed. If a test or approval is pending, state that clearly rather than checking it off.

## Repository governance

Repository owner should enable main branch protection/ruleset requiring PRs, one approval and CI, where available. Do not assume this is already enabled. Team agrees release tags, license and ownership before publication.
