# Security policy and scope

EdgeSwarm is a bounded demonstration, not a production compute/payment network. Report suspected vulnerabilities privately through GitHub's private vulnerability reporting if enabled; do not publish credentials or live exploit data in issues.

The worker and verifier use separate Ed25519 keys but execute inside the same trusted backend. That is not an independent trust domain, TEE attestation, zk proof, or proof of arbitrary AI correctness. Replay checks only the built-in uppercase transformation.

Anonymous HttpOnly SameSite=Strict cookies isolate sessions. Writes require a same-origin browser Origin header and JSON object bodies no larger than 64 KiB. Each session allows 100 jobs and 120 API operations per minute. PostgreSQL records become inaccessible after 30 minutes and expired rows are deleted on subsequent requests; the browser cookie is issued for 30 minutes. Cookie rotation bypasses session quotas, so provider-level abuse controls remain necessary.

PostgreSQL holds private demo signing keys. Restrict access, use TLS, separate preview/production databases, and rotate credentials if exposed. Do not expose snapshots through APIs. Runtime APIs never use the legacy Engine file-storage option, which does not persist signing keys and is not a supported restart-safe store.

All job settlement uses simulated credits. `/devnet-demo` is a separate wallet transfer interface, not escrow or verified-work payout. No real transaction was performed for this audit. Android P-256 evidence lacks assignment/nonce/expiry/policy binding and is deliberately ineligible for settlement.

Four moderate npm advisories remain in the Solana web3.js transitive dependency chain at audit time. No high or critical findings were reported by the captured npm audit; this is not a guarantee that the application has no vulnerabilities. Major dependency migrations require compatibility tests, not a blind `npm audit fix --force`.

CSP blocks embedding, objects, and base-URI changes; it is not a strict nonce-based script policy. Authentication, durable financial accounting, independent verifier infrastructure, distributed authorization, complete secret scanning and penetration testing remain outside the verified implementation.
