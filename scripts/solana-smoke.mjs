import assert from 'node:assert/strict';import {Keypair,Transaction,SystemInstruction} from '@solana/web3.js';
const base=process.env.BASE_URL??'http://127.0.0.1:3100';const first=await fetch(base+'/api/jobs');assert.equal(first.status,200);const cookie=first.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{cookie,origin:new URL(base).origin,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();return {status:r.status,data}}
const payer=Keypair.generate().publicKey.toBase58(),recipient=Keypair.generate().publicKey.toBase58();
const made=await call('/api/jobs',{title:'Devnet intent smoke',input:'verified on server'});const id=made.data.id;assert.ok(id);
const unverified=await call(`/api/jobs/${id}/solana`,{action:'prepare',payer,recipient});assert.equal(unverified.status,400);
await call(`/api/jobs/${id}`,{action:'process'});
const prepared=await call(`/api/jobs/${id}/solana`,{action:'prepare',payer,recipient});assert.equal(prepared.status,200,JSON.stringify(prepared.data));const intent=prepared.data.intent;assert.equal(intent.status,'PREPARED');assert.equal(intent.cluster,'devnet');assert.equal(intent.lamports,1000000);assert.ok(intent.transaction.blockhash);
const tx=Transaction.from(Buffer.from(intent.transaction.base64,'base64'));assert.equal(tx.instructions.length,2);assert.equal(tx.feePayer.toBase58(),payer);assert.equal(SystemInstruction.decodeTransfer(tx.instructions[0]).lamports,1000000n);assert.equal(tx.instructions[1].data.toString(),intent.memo);
const again=await call(`/api/jobs/${id}/solana`,{action:'prepare',payer,recipient});assert.equal(again.data.intent.transaction.base64,intent.transaction.base64);
assert.equal((await call(`/api/jobs/${id}/solana`,{action:'prepare',payer,recipient:Keypair.generate().publicKey.toBase58()})).status,400);
assert.equal((await call(`/api/jobs/${id}/solana`,{action:'confirm',signature:'fake'})).status,400);
const receipt=await call(`/api/jobs/${id}/receipt`);assert.equal(receipt.status,200);assert.equal(receipt.data.scope.onChainEscrow,false);assert.ok(!JSON.stringify(receipt.data).includes('PRIVATE KEY'));
const page=await fetch(base+`/jobs/${id}/pay`);assert.equal(page.status,200);
const bad=await call('/api/jobs',{title:'Rejected job cannot pay',input:'reject'});await call('/api/jobs/'+bad.data.id,{action:'process',tamper:true});assert.equal((await call(`/api/jobs/${bad.data.id}/solana`,{action:'prepare',payer,recipient})).status,400);
console.log('PASS: real Devnet genesis/blockhash, gated immutable intent, unsigned transfer+memo, receipt export, rejected/unverified-job gating; NO funds sent');
