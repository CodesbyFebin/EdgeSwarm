'use client';
import { useState } from 'react';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

type WalletProvider = {
  isPhantom?: boolean;
  publicKey?: { toBase58(): string };
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  signAndSendTransaction(transaction: Transaction): Promise<{ signature: string }>;
};
declare global { interface Window { solana?: WalletProvider; phantom?: { solana?: WalletProvider } } }
const ENDPOINT = 'https://api.devnet.solana.com';
const connection = () => new Connection(ENDPOINT, 'confirmed');
const explorer = (signature: string) => 'https://explorer.solana.com/tx/' + encodeURIComponent(signature) + '?cluster=devnet';

export default function DevnetJudgeDemo() {
  const [wallet, setWallet] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [signature, setSignature] = useState('');
  const [state, setState] = useState('Not connected');
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const provider = () => typeof window === 'undefined' ? undefined : (window.phantom?.solana ?? window.solana);
  async function connect() {
    setBusy(true); setState('Connecting wallet…'); setSignature('');
    try {
      const p = provider();
      if (!p?.connect || !p?.signAndSendTransaction) throw Error('Compatible injected Solana wallet not found. Open this page in a Solana wallet browser or install a compatible wallet extension.');
      const { publicKey } = await p.connect();
      const address = publicKey.toBase58();
      setWallet(address);
      const lamports = await connection().getBalance(new PublicKey(address), 'confirmed');
      setBalance(lamports / LAMPORTS_PER_SOL);
      setState('Connected to Solana Devnet. Only Devnet test SOL can be sent.');
    } catch (error) { setState(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }
  async function send() {
    setBusy(true); setSignature(''); setState('Validating Devnet transaction…');
    try {
      const p = provider();
      if (!p?.publicKey || !p.signAndSendTransaction || !wallet || p.publicKey.toBase58() !== wallet) throw Error('Connect the wallet again.');
      const sol = Number(amount);
      if (!Number.isFinite(sol) || sol < 0.000001 || sol > 0.01 || !/^\d+(\.\d{1,9})?$/.test(amount)) throw Error('Use 0.000001–0.01 Devnet SOL (up to 9 decimals).');
      const from = new PublicKey(wallet);
      const to = new PublicKey(recipient.trim());
      if (from.equals(to)) throw Error('Use a different recipient address.');
      const lamports = Math.round(sol * LAMPORTS_PER_SOL);
      const rpc = connection();
      const currentBalance = await rpc.getBalance(from, 'confirmed');
      if (currentBalance < lamports + 10000) throw Error('Insufficient Devnet SOL for transfer and fee. Fund your Devnet wallet first.');
      const { blockhash, lastValidBlockHeight } = await rpc.getLatestBlockhash('confirmed');
      const tx = new Transaction({ feePayer: from, recentBlockhash: blockhash }).add(SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports }));
      setState('Approve the Devnet test-SOL transfer in your wallet…');
      const result = await p.signAndSendTransaction(tx);
      if (!result?.signature) throw Error('Wallet did not return a transaction signature.');
      setSignature(result.signature);
      setState('Waiting for Solana Devnet confirmation…');
      const confirmation = await rpc.confirmTransaction({ signature: result.signature, blockhash, lastValidBlockHeight }, 'confirmed');
      if (confirmation.value.err) throw Error('Transaction failed on Devnet: ' + JSON.stringify(confirmation.value.err));
      setState('Confirmed on Solana Devnet. This is a wallet transfer, NOT EdgeSwarm escrow or verified-work settlement.');
      setBalance((await rpc.getBalance(from, 'confirmed')) / LAMPORTS_PER_SOL);
    } catch (error) { setState(error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }
  return <main style={{maxWidth:850,margin:'2rem auto',padding:'1.5rem',fontFamily:'system-ui',lineHeight:1.6}}>
    <a href="/">← EdgeSwarm</a>
    <h1>EdgeSwarm — Solana Devnet Judge Demo</h1>
    <p><strong>LIVE DEVNET TEST TRANSFER — NOT ESCROW.</strong> This page submits a real Solana Devnet System Program transfer of test SOL, with explicit wallet approval and an independently inspectable explorer signature. It does <strong>not</strong> pay for verified jobs, use an Anchor escrow program, or prove Android evidence.</p>
    <p>Network: <code>devnet</code> · RPC: <code>{ENDPOINT}</code> · Maximum per transfer: <code>0.01 test SOL</code>.</p>
    <section style={{border:'1px solid #777',borderRadius:12,padding:20,marginBottom:18}}>
      <h2>1. Connect your Devnet wallet</h2>
      <button disabled={busy} onClick={connect}>Connect Solana wallet</button>
      <p>Wallet: <code style={{overflowWrap:'anywhere'}}>{wallet || 'Not connected'}</code></p>
      <p>Balance: {balance === null ? '—' : balance.toFixed(6) + ' Devnet SOL'}</p>
      <p>Use the wallet&apos;s Devnet network. Test SOL has no monetary value. Never enter your seed phrase here.</p>
    </section>
    <section style={{border:'1px solid #777',borderRadius:12,padding:20,marginBottom:18}}>
      <h2>2. Send a test transfer</h2>
      <label htmlFor="recipient">Recipient Devnet public key</label>
      <input id="recipient" value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Recipient public key" style={{display:'block',width:'100%',boxSizing:'border-box',padding:12,marginBottom:12}} />
      <label htmlFor="amount">Amount (Devnet SOL)</label>
      <input id="amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{display:'block',padding:12,marginBottom:12}} />
      <button disabled={busy || !wallet || !recipient.trim()} onClick={send}>Approve and send Devnet test SOL</button>
    </section>
    <section aria-live="polite" style={{border:'1px solid #777',borderRadius:12,padding:20}}>
      <h2>3. Verify on-chain</h2>
      <p role="status">{state}</p>
      {signature && <p>Transaction: <code style={{overflowWrap:'anywhere'}}>{signature}</code><br/><a href={explorer(signature)} target="_blank" rel="noopener noreferrer">Inspect on Solana Explorer (Devnet) ↗</a></p>}
      <p>Judges: a valid explorer transaction demonstrates Devnet connectivity and wallet signing only. Independent evidence verification, escrow, payout authorization, and refund logic remain future milestones.</p>
    </section>
  </main>;
}
