# EdgeSwarm — Submission & Demo Guide

## Project
**EdgeSwarm: Sovereign Verifiable Agent Network**  
**Tagline:** Execute → Verify → Settle  
**Repository:** https://github.com/CodesbyFebin/EdgeSwarm

## Run the submitted GitHub application

Requires Node.js 20+.

```bash
git clone https://github.com/CodesbyFebin/EdgeSwarm.git
cd EdgeSwarm
npm install
npm test
npm run dev
```

- Desktop: http://localhost:3000
- Mobile demonstration: http://localhost:3000/mobile
- Health API: http://localhost:3000/api/health
- Jobs API: http://localhost:3000/api/jobs

## Five-minute judge walkthrough

1. Open the mobile view and swipe across ten screens: Home, Jobs, Job Details, Executing, Verification, Settlement, Agents, Payments, Use Cases, Profile.
2. Explain the difference between **illustrative UI state** and **verified backend job state**. The mobile design screens contain example data.
3. Open the connected Jobs panel. Create a bounded deterministic job (e.g., input `hello edgeswarm`).
4. Execute it. The local worker signs the result with Ed25519; the verifier validates the signature, assignment, nonce, expiry, result digest, and deterministic replay. A successful verdict allows **simulated-credit settlement**.
5. Enable the tamper option on a new job. Show rejection and no simulated payment.
6. Show the receipt, including hashes, worker identity, verifier signature, and payment record. Explain that these are local demo receipts, not on-chain Solana transactions.
7. Run `npm test` and show all nine backend checks.

## Architecture

```text
Next.js mobile / desktop UI
         |
      Jobs API
         |
  Local coordinator
         |
  Ed25519 signed worker result
         |
  Local verification + deterministic replay
         |
  Policy gate
         |
  Simulated credits + receipt
```

## Submission claims: implemented versus future work

| Feature | Status |
| --- | --- |
| Ten-screen mobile interface | Implemented demo route |
| Local jobs API | Implemented |
| Ed25519-signed result | Implemented |
| Replay / expiry / tamper rejection | Implemented |
| Deterministic replay verification | Implemented |
| Simulated-credit payment | Implemented |
| Nine Node backend tests | Passing in local test run |
| Full mobile source design | Available as a separate downloadable integration package |
| Production build / browser E2E | Not independently verified |
| Android device worker | Not integrated |
| Independently deployed ProofAgent | Not implemented |
| Real Solana Devnet payment | Not implemented |
| Production authentication / multi-user settlement | Not implemented |

**Do not describe the project as a production-ready Solana payment network.** Its current verifiable-work demonstration is local and uses simulated credits.

## One-minute pitch

EdgeSwarm explores a trust-minimized workflow for edge computation. A requester creates a bounded job, a worker signs the result, and a verifier checks the evidence before any settlement is allowed. Our working local prototype demonstrates the verification gate, rejects tampering and replay, and generates an inspectable receipt. The interface includes a ten-screen mobile experience inspired by Solana's visual language. Today, payments are simulated; future milestones are independent verifier deployment, Android execution, and reconciled Solana Devnet settlement.

## Evidence checklist

- [x] Source committed to GitHub `main`
- [x] Working local API and signed evidence
- [x] Nine backend regression tests pass locally
- [x] Mobile route and swipe navigation committed
- [ ] Production build verified in CI
- [ ] Browser recording captured and published
- [ ] Real Devnet transfer with explorer evidence
