# Solana Devnet demonstrations

## New: verified-job payment flow

The main app now links verified jobs to `/jobs/:id/pay`. It prepares a fixed 0.001 test-SOL transfer plus an evidence-bound Memo. The backend checks the actual confirmed transaction before recording the receipt. See [integration contract](SOLANA_INTEGRATION.md), [public live-test evidence](evidence/devnet-payment.json), and the README for the real Explorer link. This is not on-chain escrow. The remainder of this document describes the older standalone route, which remains separate.

# Solana Devnet judge demo — reproducible evidence

## What is implemented
Route: `/devnet-demo`. A connected Solana wallet explicitly signs a **real Devnet System Program transfer** of 0.000001–0.01 test SOL to a user-supplied recipient. The page waits for Devnet confirmation and links to the actual transaction signature in Solana Explorer. The wallet keeps custody of its keys. The application never requests a seed phrase.

## What this is not
This is **not** EdgeSwarm job settlement, escrow, an Anchor program, independently verified payment, or Mainnet functionality. No payment is automatically triggered by the local job verifier. Do not call the demo an escrow, claim on-chain payout enforcement, or imply a ProofAgent is deployed.

## Judge walkthrough
1. Open the deployed Next.js `/devnet-demo` page in a wallet-enabled browser (Phantom or compatible injected provider).
2. Set the wallet to **Devnet** and fund it with a small amount of Devnet test SOL from an official faucet. Never use Mainnet funds.
3. Connect the wallet. Check that the displayed address and Devnet balance match the wallet.
4. Enter a **different** Devnet public key as recipient and set 0.001 SOL.
5. Approve the transaction in the wallet; do not approve unexpected transaction contents.
6. Wait for a **confirmed** status, then open the Devnet Explorer link and verify sender, recipient, amount, and confirmation.
7. Record the actual signature and screenshot in `SUBMISSION.md` only after completing the transfer.
8. Show the existing local task-verification and tamper-rejection demo separately. Explain that it is not connected to this transfer.

## Limitations and safety
- The page relies on a compatible injected wallet, a reachable public Devnet RPC, and an adequately funded Devnet account.
- The public RPC may rate-limit requests. Wallets can reject or fail transactions; errors are shown rather than simulated.
- Browser wallet support on Android depends on the wallet's in-app browser or compatible extension.
- There is no server-side authentication, escrow custody, independent payout authorization, receipt persistence, or on-chain replay protection.
- A confirmed transfer proves only that the user approved a Devnet transfer, not that EdgeSwarm independently verified an Android job.

## Requirements before describing it as verifiable settlement
- Real Android-signed evidence accepted by a Node verifier with negative tamper tests.
- Authenticated worker and verifier identities; persistent job-to-verdict mapping.
- Audited or thoroughly tested Anchor escrow with authorized release, expiry refunds, replay protection, and double-release rejection.
- Actual Devnet program ID, escrow funding/release/refund signatures, CI test evidence, and a public demo deployment.

## Submission evidence checklist
- [ ] CI passes for the judge demo commit.
- [ ] `/devnet-demo` loads on a public deployment.
- [ ] Wallet connects and shows the correct Devnet balance.
- [ ] A real test transfer is confirmed with a public explorer signature.
- [ ] Demo video shows the wallet approval and explorer verification.
- [ ] Android evidence interoperability and escrow are correctly marked pending.
