# Android P-256 evidence interoperability — first integration gate

This adds a Node.js verifier for the **existing** Android local demonstration wire format. It uses the Android-provided X.509 SPKI public key, P-256 ECDSA with SHA-256, DER-encoded signature, and exactly the signed bytes in `MainActivity.kt`. The verifier requires an independently trusted input and an explicit public-key allowlist. It independently recomputes the uppercase output and SHA-256 hashes.

Run `npm test` to execute the Node test suite.

## Security boundary

**LOCAL_DEMO evidence is not settlement eligible.** The Android payload lacks authenticated assignment, coordinator signature, network binding, expiry, nonce, replay ledger, and verifier policy. A self-provided public key is not an identity: the caller must supply registered keys from an authenticated registry. The current JavaScript tests generate a P-256 signature using Node; a real Android-exported JSON fixture and Android instrumentation tests are still required before declaring Kotlin-to-Node interoperability proven.

Next steps: canonical versioned assignment protocol; authenticated Android registration and key rotation; independently deployed verifier; durable evidence/replay state; audited Solana Devnet escrow and finality reconciliation. Never wire this local verifier directly to a payout endpoint.
