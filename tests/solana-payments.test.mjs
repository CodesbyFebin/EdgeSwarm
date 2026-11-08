import test from 'node:test';import assert from 'node:assert/strict';
import {Keypair,Transaction,SystemInstruction,SystemProgram} from '@solana/web3.js';
import {Engine} from '../lib/core.mjs';
import {preparePaymentIntent,unsignedPaymentTransaction,markPaymentSubmitted,validateDevnetTransaction,confirmPaymentReceipt,DEVNET_GENESIS,MEMO_PROGRAM} from '../lib/solana-payments.mjs';
const payer=Keypair.generate().publicKey.toBase58(),recipient=Keypair.generate().publicKey.toBase58();
const signature='5'.repeat(88),blockhash=Keypair.generate().publicKey.toBase58();
function fixture(){const now=1800000000000;const e=new Engine({now:()=>now});const j=e.create({title:'Solana test job',input:'verified work'});e.process(j.id);preparePaymentIntent(e,j.id,{payer,recipient});j.solanaIntent.transaction={blockhash,lastValidBlockHeight:100};const intent=markPaymentSubmitted(e,j.id,signature);const tx={slot:123,blockTime:now/1000,transaction:{signatures:[signature],message:{recentBlockhash:blockhash,accountKeys:[{pubkey:payer,signer:true,writable:true},{pubkey:recipient,signer:false,writable:true}],instructions:[{programId:SystemProgram.programId.toBase58(),parsed:{type:'transfer',info:{source:payer,destination:recipient,lamports:1000000}}},{programId:MEMO_PROGRAM,parsed:intent.memo}]}},meta:{err:null,fee:5000,preBalances:[2000000,0],postBalances:[995000,1000000],innerInstructions:[]}};const status={err:null,confirmationStatus:'confirmed'};return {e,j,intent,tx,status}}
const check=f=>validateDevnetTransaction(f.intent,f.tx,f.status,{genesisHash:DEVNET_GENESIS,signature});
test('verified job has immutable signed Devnet intent',()=>{const f=fixture();assert.equal(f.intent.cluster,'devnet');assert.equal(f.intent.lamports,1000000);assert.ok(f.intent.authorizationSignature);assert.equal(preparePaymentIntent(f.e,f.j.id,{payer,recipient}).intentId,f.intent.intentId);assert.throws(()=>preparePaymentIntent(f.e,f.j.id,{payer,recipient:Keypair.generate().publicKey.toBase58()}),/immutable/)});
test('unverified and rejected jobs cannot prepare payments',()=>{const e=new Engine();const j=e.create({title:'new job',input:'work'});assert.throws(()=>preparePaymentIntent(e,j.id,{payer,recipient}),/verified/);e.process(j.id,{tamper:true});assert.throws(()=>preparePaymentIntent(e,j.id,{payer,recipient}),/verified/)});
test('off-curve and identical recipient rejected',()=>{const e=new Engine();const j=e.create({title:'new job',input:'work'});e.process(j.id);assert.throws(()=>preparePaymentIntent(e,j.id,{payer,recipient:payer}),/differ/);assert.throws(()=>preparePaymentIntent(e,j.id,{payer,recipient:'bad'}),/address/)});
test('transaction contains exactly one fixed transfer and signed memo',()=>{const e=new Engine({now:()=>1800000000000});const j=e.create({title:'new job',input:'work'});e.process(j.id);const intent=preparePaymentIntent(e,j.id,{payer,recipient});const encoded=unsignedPaymentTransaction(intent,{blockhash,lastValidBlockHeight:100},e.now());const tx=Transaction.from(Buffer.from(encoded,'base64'));assert.equal(tx.instructions.length,2);assert.equal(tx.feePayer.toBase58(),payer);const transfer=SystemInstruction.decodeTransfer(tx.instructions[0]);assert.equal(transfer.toPubkey.toBase58(),recipient);assert.equal(transfer.lamports,1000000n);assert.equal(tx.instructions[1].data.toString(),intent.memo);assert.equal(tx.instructions[1].keys[0].isSigner,true)});
test('expired intent cannot produce unsigned payment',()=>{const f=fixture();assert.throws(()=>unsignedPaymentTransaction({...f.intent,status:'PREPARED',signature:null},{blockhash,lastValidBlockHeight:100},f.intent.expiresAt+1),/expired/)});
test('submitted payment cannot issue another transaction',()=>{const f=fixture();assert.throws(()=>unsignedPaymentTransaction(f.intent,{blockhash,lastValidBlockHeight:100},f.e.now()),/submitted/)});
test('valid synthetic RPC fixture produces checked receipt',()=>{const receipt=check(fixture());assert.equal(receipt.verification,'SERVER_RPC_CHECKED');assert.equal(receipt.escrow,false);assert.equal(receipt.lamports,1000000)});
for(const [name,change] of [
 ['failed on-chain transaction',f=>f.tx.meta.err={InstructionError:[0,'error']}],
 ['unconfirmed signature',f=>f.status.confirmationStatus='processed'],
 ['failed signature status',f=>f.status.err={InstructionError:[0,'error']}],
 ['wrong recipient',f=>f.tx.transaction.message.instructions[0].parsed.info.destination=payer],
 ['wrong payer',f=>f.tx.transaction.message.instructions[0].parsed.info.source=recipient],
 ['wrong amount',f=>f.tx.transaction.message.instructions[0].parsed.info.lamports=1],
 ['missing memo',f=>f.tx.transaction.message.instructions.pop()],
 ['wrong memo',f=>f.tx.transaction.message.instructions[1].parsed='different job'],
 ['duplicate transfer',f=>f.tx.transaction.message.instructions.push(f.tx.transaction.message.instructions[0])],
 ['unexpected program',f=>f.tx.transaction.message.instructions.push({programId:payer})],
 ['unexpected inner instruction',f=>f.tx.meta.innerInstructions=[{instructions:[{}]}]],
 ['recipient balance mismatch',f=>f.tx.meta.postBalances[1]=0],
 ['payer balance mismatch',f=>f.tx.meta.postBalances[0]=1000000],
 ['wrong fee payer',f=>f.tx.transaction.message.accountKeys[0].pubkey=recipient],
 ['non-signing payer',f=>f.tx.transaction.message.accountKeys[0].signer=false],
 ['old transaction replay',f=>f.tx.blockTime-=3600],
 ['late transaction',f=>f.tx.blockTime+=3600],
 ['missing block time',f=>f.tx.blockTime=null],
 ['different blockhash',f=>f.tx.transaction.message.recentBlockhash=recipient],
 ['different transaction signature',f=>f.tx.transaction.signatures[0]='6'.repeat(88)]
])test(name+' is rejected',()=>{const f=fixture();change(f);assert.throws(()=>check(f))});
test('wrong cluster rejected even with matching payment data',()=>{const f=fixture();assert.throws(()=>validateDevnetTransaction(f.intent,f.tx,f.status,{genesisHash:'mainnet',signature}),/not Solana Devnet/)});
test('missing transaction rejected',()=>{const f=fixture();f.tx=null;assert.throws(()=>check(f),/missing/)});
test('signature replacement is blocked',()=>{const f=fixture();assert.throws(()=>markPaymentSubmitted(f.e,f.j.id,'6'.repeat(88)),/different signature/)});
test('confirmed receipt persists once and survives engine restoration',()=>{const f=fixture();const receipt=check(f);confirmPaymentReceipt(f.e,f.j.id,receipt);confirmPaymentReceipt(f.e,f.j.id,receipt);assert.equal(f.e.state.events.filter(e=>e.type==='DEVNET_PAYMENT_CONFIRMED').length,1);const restored=Engine.restore(JSON.parse(JSON.stringify(f.e.snapshot())));assert.equal(restored.get(f.j.id).solanaIntent.receipt.signature,signature)});
test('cross-job receipt rejected',()=>{const f=fixture();const receipt=check(f);receipt.intentId='wrong';assert.throws(()=>confirmPaymentReceipt(f.e,f.j.id,receipt),/does not match/)});
