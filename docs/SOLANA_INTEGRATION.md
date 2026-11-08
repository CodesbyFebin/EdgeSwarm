# Verified-job Solana Devnet payment contract

## Implemented sequence

1. A session-scoped job passes the core engine’s signed-evidence and replay gate.
2. `POST /api/jobs/:id/solana` with `{action:"prepare",payer,recipient}` fixes the payer, recipient and 1,000,000 lamport payment. Both addresses must be on-curve wallet keys and must differ.
3. The intent binds the job ID, task/result digests, signed verdict, worker/verifier identities, payer, recipient, amount, cluster, unique intent ID and validity window. The backend verifier signs its authorization. The Memo carries job ID, intent ID and the binding digest.
4. The server verifies the public RPC’s Devnet genesis hash and prepares an unsigned transfer + Memo transaction using a real Devnet blockhash. Repeated preparation returns the same stored transaction. The client checks the reviewed transaction fields before asking its injected wallet to sign.
5. A successful wallet submission returns a transaction signature. The UI stores that public signature locally for reconciliation and does not automatically submit another transfer after a confirmation error.
6. `POST /api/jobs/:id/solana` with `{action:"confirm",signature}` binds one submitted signature. The server reads Devnet transaction and signature status data and checks success, confirmation, blockhash, payer, recipient, amount, Memo, validity window, allowed instruction programs, absence of inner instructions and balance deltas.
7. A matching receipt is recorded idempotently. `GET /api/jobs/:id/receipt` exports the job evidence, intent and checked receipt, without private keys. Records remain temporary: export before the session expires.

## Evidence

[The captured live receipt](evidence/devnet-payment.json) is from an approved disposable-key test through the deployed API. The transfer was confirmed on Devnet and validated server-side. It is not a synthetic transaction. In contrast, negative unit tests deliberately use synthetic RPC fixtures to isolate failure paths. The test harness signed in memory, not through a browser wallet; injected-wallet approval requires an additional browser/wallet integration pass.

The RPC `requestAirdrop` method returned HTTP 410 (closed faucet). The official faucet website funded the test through GitHub authentication. The first in-memory process ended after funding without submitting; a separately approved replacement test completed. No private key was saved to a file or committed. No Mainnet funds or paid services were used.

## Trust model

The backend is a centralized trust domain. It can attest that its own verifier approved its built-in task; the Memo program does not evaluate that policy. The wallet owns the funds and explicitly approves a direct transfer. The chosen recipient is not cryptographically registered as the worker. There is no escrow, refund program, hardware attestation, zk proof, independent verifier operator or on-chain job-level replay lock. A user can send a second payment outside the app; backend idempotence does not prevent that on-chain.

The implementation trusts the public Devnet RPC’s chain view. Confirmed transactions can have weaker finality than finalized transactions. The app is not a production settlement service. Fixed small test amounts reduce demonstration risk, not architectural trust requirements.

## Verification commands

```sh
npm test
npm run build
npm run typecheck
BASE_URL=https://edge-swarm.vercel.app node scripts/smoke.mjs
BASE_URL=https://edge-swarm.vercel.app node scripts/solana-smoke.mjs
```

The first smoke test exercises signed execution, tamper rejection, session isolation and simulated settlement. The second checks actual Devnet genesis/blockhash reads and payment-intent construction, without sending funds. `scripts/devnet-e2e.mjs` is an explicitly gated test-funds harness; never run it without approval. RPC faucet funding may be unavailable; its browser-funding option waits for an approved manual faucet request while retaining keys only in process memory.

## Primary references

- [Solana transaction structure and atomic execution](https://solana.com/docs/core/transactions)
- [Memo program semantics and signer checks](https://www.solana-program.com/docs/memo)
- [Official Devnet faucet](https://faucet.solana.com/)
