# EdgeSwarm audit and hardening, 2026-11-08

Baseline: `0790837f4d2bc4bbf200f929dddb1803460187f8` on main. This is an engineering review and test pass, not an independent security certification or official hackathon score.

## Final-app and Solana integration follow-up

The user-provided Final EdgeSwarm App archive supplied the visual device shell, brand mark, swipe navigation and tab bar. Its filesystem backend, prepared-payment claims, Mainnet labels, fabricated sample earnings and TypeScript build-error suppression were not carried into the final integration. The screens were connected to the hardened session-scoped backend. Desktop functionality remains at `/dashboard`.

- Final implementation: `9a0febb`, CI [42511366802](https://github.com/CodesbyFebin/EdgeSwarm/actions/runs/42511366802) passed web checks and Android APK build.
- 64 automated tests passed, including adversarial transaction-validation fixtures. Build and TypeScript checks passed.
- Live API smoke and real Devnet RPC intent smoke passed; the latter sends no funds.
- An explicitly approved disposable-wallet test then sent 0.001 Devnet SOL through the live verified-job intent flow. Server-side confirmation, receipt persistence and idempotent confirmation passed. [Explorer](https://explorer.solana.com/tx/37XG6ENuZstcqzfDjcFRR4DnifS1bN12E2id1aAiJ58zTs9246xgonRiA9KmtuHpwmX237MLXkh3y6UhpDP9KqMk?cluster=devnet); [public evidence](evidence/devnet-payment.json).
- The first disposable process ended after funding but before transferring; no payment is claimed for it. A separately approved replacement test completed. No private-key files were created.
- Remaining limits: centralized verifier trust; no on-chain escrow/global release guard; no authenticated recipient registration; browser wallet approval and physical Android execution not end-to-end tested; 4 moderate dependency findings remain.

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
