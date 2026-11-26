# Security and privacy

CV Studio is a pre-release student project. Do not use it for real sensitive CV information until live isolation testing and customer-approved privacy arrangements are complete.

## Reporting a vulnerability

Do not include exploit details, access tokens or private CV data in a public issue. Contact the repository maintainer or course/customer contact through an agreed private channel. If GitHub private vulnerability reporting is enabled, use that option. Include affected commit, impact and a minimal fictional reproduction. A formal security contact and response process must be agreed before public launch.

## Existing controls and remaining work

The supplied SQL defines authenticated owner-only RLS policies and table grants. The frontend uses memory-only sessions and public keys; no elevated key belongs in client code. Input escaping, photo validation and local server restrictions are implemented. Live RLS checks, data quotas, full Auth account deletion, privacy notice/retention and security review remain outstanding.

Follow [SECURITY_TESTS.md](docs/testing/SECURITY_TESTS.md) for the live verification procedure. It requires two empty disposable test accounts and can erase their data. Do not use regular accounts.

Experimental AI is disabled in core. Do not enable it without separate privacy, cost, provider and security approval.
