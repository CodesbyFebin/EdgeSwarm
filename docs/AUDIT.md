# EdgeSwarm audit and hardening, 2026-11-08

Baseline: `0790837f4d2bc4bbf200f929dddb1803460187f8` on main. This is an engineering review and test pass, not an independent security certification or official hackathon score.

## Evidence

- Baseline: 16 Node tests passed.
- Hardened version: 32 Node tests passed locally, including snapshot/key restoration, tampering after verdict, reward mutation, expiry, duplicate payment, and input validation.
- Next.js 15.5.29 production build and TypeScript check passed during implementation. Final CI is the source of truth for the pushed revision.
- Production API smoke passed after the PostgreSQL refactor locally and live on both `https://edge-swarm.vercel.app` and `https://www.agentswarm.in` for commit `785a40b`; it covers create/process/settle, duplicate settlement, tamper rejection, per-browser isolation, forbidden cross-origin writes, route availability and security headers. Re-run after future deployments.
- Actual hosted Neon PostgreSQL integration passed for separate engine instances, key restoration, concurrent settlement without duplicate payment, session isolation and session expiry configuration.
- Browser desktop flow passed: create job, execute/verify, show `SETTLED`, `HELLO EDGESWARM`, verification PASS, and 50 simulated credits. This is local browser evidence, not live hosting evidence.
- Initial npm audit: six findings (one high, five moderate). PostCSS override and lockfile reduced it to four moderate findings, zero high/critical. Remaining packages: @solana/web3.js, jayson, stream-json, uuid.
- Existing GitHub CI at baseline reported successful web checks and Android APK compilation. That does not establish real-device interoperability. Updated CI run [42506466254](https://github.com/CodesbyFebin/EdgeSwarm/actions/runs/42506466254) passed web tests/build, production API smoke and Android debug APK compilation for `785a40b`.

## Findings and changes

| Finding | Change / remaining limitation |
|---|---|
| Shared unauthenticated state exposed all demo jobs | Per-browser sessions; no claim of real user authentication |
| Serverless instances lose state and signing identities | Shared PostgreSQL records with restored signing keys and atomic compare-and-set updates; Vercel fails closed if unconfigured |
| Unbounded request bodies and job counts | 64 KiB JSON limit, 100 jobs/session, request quota; no IP-wide protection |
| Settlement trusted a status flag and did not re-check changed evidence | Verify signed verdict and re-check result, assignment, nonce, policy, input digest, reward and expiry before simulated payment |
| Reward absent from signed result | Reward now included in signed result and checked before settlement |
| No lockfile / non-reproducible npm install in CI | package-lock.json committed and CI uses npm ci |
| Missing baseline browser security headers | nosniff, frame denial, referrer policy, permissions policy and limited CSP |
| Deployment/README claims inconsistent | Current deployment/security notes take precedence over older design text; Pages landing remains unchanged |
| Restart-unsafe legacy JSON storage | Runtime no longer uses it; unsupported option remains in Engine for historical code compatibility |

## Unfinished requirements

Hosted PostgreSQL connectivity and concurrent settlement were tested. Vercel deployment `J8GwUDtzfA3G4DoCngkFxFD63nsY` is Ready for commit `785a40b`. Live job flows passed on both configured domains. No wallet transaction, production authentication, independent remote verifier, Anchor escrow program, or hardware attestation has been verified. Android code was reviewed but no physical-device test was run. Mobile route exists; a complete mobile accessibility/viewport/device test matrix was not run. Docker was not built. No load test, exhaustive secret-history scan, or penetration test was run.

The supplied MLH submission URL returned Page Not Found. The event deadline and judging rubric therefore remain unverified. There is no defensible official 100/100 score or guaranteed win. A competitive Solana submission still needs a coherent on-chain use case and inspectable transaction evidence; a separate Devnet wallet transfer must not be misrepresented as verified-work settlement.

## Next acceptance criteria

1. Completed: Vercel and free Neon PostgreSQL configured; full live smoke tests passed on both domains.
2. Completed: CI web checks and Android build passed for `785a40b`.
3. Record a short honest demo: valid work settles simulated credits; tampered work does not.
4. Obtain the actual event rubric and decide whether real verified-work Devnet settlement is mandatory before implementing a separate audited program.
