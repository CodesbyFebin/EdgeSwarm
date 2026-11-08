# Security policy and scope

EdgeSwarm is a bounded demonstration, not a production compute/payment network. Report suspected vulnerabilities privately through GitHub's private vulnerability reporting if enabled; do not publish credentials or live exploit data in issues.

The worker and verifier use separate Ed25519 keys but execute inside the same trusted backend. That is not an independent trust domain, TEE attestation, zk proof, or proof of arbitrary AI correctness. Replay checks only the built-in uppercase transformation.

Anonymous HttpOnly SameSite=Strict cookies isolate sessions. Writes require a same-origin browser Origin header and JSON object bodies no larger than 64 KiB. Each session allows 100 jobs and 120 API operations per minute. PostgreSQL records become inaccessible after 30 minutes and expired rows are deleted on subsequent requests; the browser cookie is issued for 30 minutes. Cookie rotation bypasses session quotas, so provider-level abuse controls remain necessary.

PostgreSQL holds private demo signing keys. Restrict access, use TLS, separate preview/production databases, and rotate credentials if exposed. Do not expose snapshots through APIs. Runtime APIs never use the legacy Engine file-storage option, which does not persist signing keys and is not a supported restart-safe store.

All job settlement uses simulated credits. `/devnet-demo` is a separate wallet transfer interface, not escrow or verified-work payout. No real transaction was performed for this audit. Android P-256 evidence lacks assignment/nonce/expiry/policy binding and is deliberately ineligible for settlement.

Four moderate npm advisories remain in the Solana web3.js transitive dependency chain at audit time. No high or critical findings were reported by the captured npm audit; this is not a guarantee that the application has no vulnerabilities. Major dependency migrations require compatibility tests, not a blind `npm audit fix --force`.

CSP blocks embedding, objects, and base-URI changes; it is not a strict nonce-based script policy. Authentication, durable financial accounting, independent verifier infrastructure, distributed authorization, complete secret scanning and penetration testing remain outside the verified implementation.

## Verified-job Solana Devnet payments

The new `/api/jobs/:id/solana` API creates a fixed 0.001 test-SOL payment intent only for valid signed job evidence. The payer and recipient are user-selected on-curve wallet addresses and become immutable once prepared. The app constructs a transfer plus a Memo containing job ID, intent ID and evidence digest. It does not custody wallet keys.

Confirmation uses the fixed public Devnet RPC and checks the genesis hash, confirmed/finalized status, transaction success, signature, blockhash, payer signer, exact recipient and amount, memo, balance deltas and unexpected programs/instructions. Transaction evidence is persisted with the temporary session and can be exported. A pasted signature alone is not a receipt.

This is centralized verifier-gated wallet payment, **not on-chain escrow**. The chain executes transfer/Memo instructions, not the job-verification policy. Users can send payments outside the app; no global on-chain double-release protection exists. The recipient is not an authenticated worker. RPC responses are a trust dependency. Public RPC rate limits, session expiry, missing wallet support and insufficient test SOL can block the flow. If signing or confirmation is ambiguous, inspect wallet history and reconcile; do not blindly resend. Synthetic RPC fixtures test validation rules, not real transaction landing.
