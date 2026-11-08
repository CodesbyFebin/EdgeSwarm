// Explicit opt-in: this sends ONLY disposable-wallet Devnet test SOL.
// Keys exist only in memory. Never point this harness at Mainnet or a personal wallet.
import assert from 'node:assert/strict';import {writeFileSync} from 'node:fs';
import {Connection,Keypair,Transaction} from '@solana/web3.js';
import {DEVNET_RPC,DEVNET_GENESIS} from '../lib/solana-payments.mjs';
if(process.env.ALLOW_DEVNET_TEST_TRANSFER!=='yes')throw Error('Set ALLOW_DEVNET_TEST_TRANSFER=yes only after authorizing a 0.001 Devnet SOL transfer and faucet funding');
const base=process.env.BASE_URL??'https://edge-swarm.vercel.app';
const rpc=new Connection(DEVNET_RPC,{commitment:'confirmed',disableRetryOnRateLimit:true});assert.equal(await rpc.getGenesisHash(),DEVNET_GENESIS);
const payer=Keypair.generate(),recipient=Keypair.generate().publicKey;
console.log('Disposable Devnet payer:',payer.publicKey.toBase58());console.log('Disposable recipient:',recipient.toBase58());
let airdrop=null;
if(process.env.FAUCET_MODE==='browser'){writeFileSync('../devnet-public-test-wallet.json',JSON.stringify({payer:payer.publicKey.toBase58(),recipient:recipient.toBase58()}));console.log('Awaiting official faucet funding (private key only in process memory)');for(let attempt=0;attempt<60;attempt++){console.log('Waiting for funding',attempt);if(await rpc.getBalance(payer.publicKey)>=1_010_000)break;if(attempt===59)throw Error('Official faucet funding unavailable; no transfer sent');await new Promise(resolve=>setTimeout(resolve,5000))}}else{airdrop=await rpc.requestAirdrop(payer.publicKey,1_000_000_000);console.log('Devnet faucet request signature:',airdrop);await rpc.confirmTransaction(airdrop,'confirmed')}
assert.ok(await rpc.getBalance(payer.publicKey)>=1_010_000);
const first=await fetch(base+'/api/jobs');assert.equal(first.status,200);const cookie=first.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{cookie,origin:new URL(base).origin,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(JSON.stringify(data));return data}
const job=await call('/api/jobs',{title:'Verified Devnet end-to-end evidence',input:'signed work verified before payment',reward:50});
assert.equal((await call(`/api/jobs/${job.id}`,{action:'process'})).status,'SETTLED');
const prepared=await call(`/api/jobs/${job.id}/solana`,{action:'prepare',payer:payer.publicKey.toBase58(),recipient:recipient.toBase58()});assert.equal(prepared.intent.lamports,1_000_000);assert.equal(prepared.intent.cluster,'devnet');
const tx=Transaction.from(Buffer.from(prepared.intent.transaction.base64,'base64'));tx.sign(payer);
const signature=await rpc.sendRawTransaction(tx.serialize(),{skipPreflight:false,maxRetries:2});console.log('Submitted 0.001 Devnet SOL signature:',signature);
await rpc.confirmTransaction({signature,blockhash:prepared.intent.transaction.blockhash,lastValidBlockHeight:prepared.intent.transaction.lastValidBlockHeight},'confirmed');
let confirmed;
for(let attempt=0;attempt<5;attempt++){try{confirmed=await call(`/api/jobs/${job.id}/solana`,{action:'confirm',signature});break}catch(error){if(attempt===4)throw error;await new Promise(resolve=>setTimeout(resolve,1500))}}
assert.equal(confirmed.intent.status,'CONFIRMED');assert.equal((await call(`/api/jobs/${job.id}/solana`,{action:'confirm',signature})).intent.status,'CONFIRMED');
const receipt=await call(`/api/jobs/${job.id}/receipt`);assert.equal(receipt.solanaIntent.receipt.signature,signature);assert.ok(!JSON.stringify(receipt).includes('PRIVATE KEY'));
const evidence={testedAt:new Date().toISOString(),app:base,cluster:'devnet',payer:payer.publicKey.toBase58(),recipient:recipient.toBase58(),lamports:1_000_000,airdrop,signature,explorer:`https://explorer.solana.com/tx/${signature}?cluster=devnet`,receipt};
writeFileSync(process.env.EVIDENCE_PATH??'devnet-e2e-evidence.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify({result:'PASS',jobId:job.id,signature,explorer:evidence.explorer,receiptPersisted:true,privateKeysSaved:false},null,2));
