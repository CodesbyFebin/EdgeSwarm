# EdgeSwarm: judge walkthrough

**Pitch:** An agent saying “done” should not be enough to justify a payment. EdgeSwarm shows a bounded task, signed evidence, explicit verification, and an inspectable receipt. Tampered work fails before simulated credit settlement.

## Live links

- App: https://edge-swarm.vercel.app/
- Mobile: https://edge-swarm.vercel.app/mobile
- Website: https://codesbyfebin.github.io/EdgeSwarm/
- Separate Devnet wallet demo: https://edge-swarm.vercel.app/devnet-demo
- Repository: https://github.com/CodesbyFebin/EdgeSwarm
- Verified CI and Android APK: https://github.com/CodesbyFebin/EdgeSwarm/actions/runs/42511366802

## Three-minute demonstration

1. Create a job with input `hello edgeswarm`.
2. Execute, verify, and simulate settlement. Show output `HELLO EDGESWARM`, the verification checks, and the receipt.
3. Turn on tampering, create a second job, and show rejection with no simulated payment.
4. Explain that worker and verifier keys are separate, but both run inside one trusted backend. Replay verifies the built-in transformation, not arbitrary AI correctness.
5. Show the mobile route and the CI run: 64 automated tests, production build, API smoke test, and Android debug APK build.
6. Open a verified job’s Devnet payment route. Explain the immutable payer/recipient/amount, evidence-bound Memo, explicit wallet approval and server-side confirmation checks. Show the [actual live-test transaction](https://explorer.solana.com/tx/37XG6ENuZstcqzfDjcFRR4DnifS1bN12E2id1aAiJ58zTs9246xgonRiA9KmtuHpwmX237MLXkh3y6UhpDP9KqMk?cluster=devnet) and [exported receipt](docs/evidence/devnet-payment.json). The separate standalone wallet demo is not job escrow; neither is the new flow. The real test signed with disposable keys in a harness, not a browser wallet.

## What a judge can verify today

The Next.js app and API are live on Vercel with temporary session state in free Neon PostgreSQL. Signed results, replay checks, tamper rejection, and simulated credits are implemented. Live API smoke tests passed on both edge-swarm.vercel.app and www.agentswarm.in for the final-app implementation commit 9a0febb. Hosted PostgreSQL tests cover restored signing identities, cross-call state, concurrency, and duplicate simulated-payment prevention.

Android source and a CI-built debug APK exist. No physical-device interoperability test, independent remote verifier, Mainnet transaction, on-chain escrow, hardware attestation, or zk proof is claimed. See [audit](docs/AUDIT.md) and [security scope](SECURITY.md).

## Submission integrity

The supplied submission screenshot reports an editing cutoff of November 8, 1:00 PM EST. Work performed after the event cutoff must not be presented as having been completed during the hacking window. Commit timestamps are not to be backdated. This guide does not establish eligibility or an official score.
