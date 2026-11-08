# EdgeSwarm

**Execute. Verify. Settle.**

EdgeSwarm is an open-source edge-agent work platform in active development. It combines a Next.js task dashboard, a Kotlin Android EdgeAgent, P-256 signed task evidence, deterministic verification, and a Solana Devnet transaction integration.

![EdgeSwarm hero](https://github.com/user-attachments/assets/0f25b2a7-0606-4e58-92c6-c75d310eb3b0)

[Source code](https://github.com/CodesbyFebin/EdgeSwarm) · [CI](https://github.com/CodesbyFebin/EdgeSwarm/actions) · [Security](#security-and-deployment) · [Devnet integration](#solana-devnet) · [Roadmap](#release-gates)

## What is implemented

| Capability | Evidence / current scope |
| --- | --- |
| Next.js task dashboard | Job creation, execution, verification results, receipts, metrics |
| Node verification | P-256 ECDSA checks, deterministic replay, negative tests using Node-generated fixtures |
| Android EdgeAgent | Kotlin app, Android Keystore P-256 signing, evidence sharing; debug APK compiled in CI |
| Physical Android device | Project owner reports successful installation and operation |
| Solana Devnet | Wallet-approved test-SOL transfer page at `/devnet-demo` on the development branch |
| Local credits | In-process simulated accounting, **not** blockchain payments |

The current software is a prototype, not an audited or production-ready distributed network. The Android-to-Node verification path using **actual Android-generated evidence** still needs an independently recorded pass. A confirmed public Devnet transaction has not yet been supplied. There is no deployed Anchor escrow or independently operated ProofAgent.

## Architecture

```text
Requester → bounded job → EdgeAgent (Kotlin / local worker)
                                 ↓
                          signed task evidence
                                 ↓
                   verifier → checks + deterministic replay
                                 ↓
                       ACCEPT / REJECT decision
                                 ↓
                  local credit receipt (current)
                                 ↓
             Solana escrow release (planned; not wired)
```

A valid signature proves possession of a signing key, not the correctness of arbitrary work. Worker identity, freshness, replay protection, and independent verification are separate trust requirements.

## Quick start

Requires Node.js 22+.

```bash
git clone https://github.com/CodesbyFebin/EdgeSwarm.git
cd EdgeSwarm
npm install
npm test
npm run build
npm run dev
```

Open the local Next.js URL printed by the development server. The package is private and is **not** published as an npm library.

### Android

The Kotlin app is under `android/`. The CI workflow builds an Android debug APK and uploads it as an Actions artifact. See `android/README.md` for setup and evidence export.

## Solana Devnet

The `/devnet-demo` page on the development branch connects a compatible injected wallet to **Solana Devnet**, requests explicit approval for a small **test-SOL** transfer, waits for confirmation, and links the signature to Solana Explorer. It is not an escrow contract and does not release funds based on a verified job.

See [the Devnet judge walkthrough](docs/DEVNET_JUDGE_DEMO.md) for setup, scope, and evidence requirements. Never provide a seed phrase or use mainnet funds for testing.

## Security and deployment

**Do not expose the current jobs API as an unrestricted public service.** The job routes have no authentication, authorization, rate limiting, or durable multi-instance persistence. The local execution and credit engine is not suitable for handling real assets. Wallet approval of a Devnet test transfer does not establish job-verification-based settlement.

Production deployment requires authentication, request limits, durable job and evidence storage, authorized verifier identities, replay protection, a reviewed escrow program, and end-to-end tests.

## Release gates

- [x] Node verifier tests using Node-generated P-256 evidence
- [x] Next.js production build on previously checked CI runs
- [x] Android debug APK build on previously checked CI runs
- [x] Android APK working on a real device (reported by project owner)
- [x] Wallet-approved Devnet transfer implementation committed
- [ ] Current branch passes all CI checks
- [ ] Real Android-generated evidence verified independently by Node
- [ ] Live deployed web URL verified from an external browser
- [ ] Confirmed Devnet transaction signature publicly inspectable
- [ ] Authenticated and rate-limited public API
- [ ] Independent ProofAgent and persisted verdicts
- [ ] Solana escrow funding, authorized release, refund, and double-release rejection
- [ ] External security review and production-readiness assessment

## Contributing

Review the source, run the tests, and open issues or pull requests with reproducible evidence. Please report vulnerabilities privately rather than publishing working exploits.

**License:** Apache-2.0. See [LICENSE](LICENSE).
