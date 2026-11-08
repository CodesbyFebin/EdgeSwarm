import {randomUUID,sign} from 'node:crypto';
import {PublicKey,Transaction,SystemProgram,TransactionInstruction} from '@solana/web3.js';
import {canonical,digest} from './core.mjs';
export const DEVNET_RPC='https://api.devnet.solana.com';
export const DEVNET_GENESIS='EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
export const MEMO_PROGRAM='MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
export const COMPUTE_BUDGET_PROGRAM='ComputeBudget111111111111111111111111111111';
export const PAYMENT_LAMPORTS=1_000_000; // Fixed 0.001 Devnet test SOL, never real funds.
export const SIGNATURE=/^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
function address(value){if(typeof value!=='string'||value.length>44)throw Error('Invalid wallet address');let key;try{key=new PublicKey(value)}catch{throw Error('Invalid wallet address')}if(key.toBase58()!==value||!PublicKey.isOnCurve(key.toBytes()))throw Error('Use an on-curve wallet public key');return value}
export function assertJobEvidence(engine,id,{fresh=true}={}){
 const job=engine.get(id);if(!job||!['VERIFIED','SETTLED'].includes(job.status))throw Error('A verified job is required');
 // The core engine owns signature verification; reuse its verification gate.
 engine.assertVerified(id,{fresh});
 return job;
}
export function preparePaymentIntent(engine,id,{payer,recipient}){
 const job=assertJobEvidence(engine,id);payer=address(payer);recipient=address(recipient);
 if(payer===recipient)throw Error('Recipient must differ from payer');
 if(job.solanaIntent){const intent=job.solanaIntent;if(intent.payer!==payer||intent.recipient!==recipient)throw Error('Payment intent is immutable; use the original payer and recipient');return structuredClone(intent)}
 const intentId=randomUUID();const createdAt=engine.now();
 const binding={jobId:id,taskHash:job.taskHash,resultHash:job.result.envelope.resultHash,verdictSignature:job.verdict.signature,workerPub:engine.workerPublic,verifierPub:engine.verifierPublic,payer,recipient,lamports:PAYMENT_LAMPORTS,cluster:'devnet',intentId};
 const evidenceHash=digest(canonical(binding));
 const authorization={...binding,evidenceHash,createdAt,expiresAt:Math.min(job.expiresAt,createdAt+600000)};
 const authorizationSignature=sign(null,Buffer.from('EDGESWARM_DEVNET_INTENT_V1\n'+canonical(authorization)),engine.verifier.privateKey).toString('base64');
 job.solanaIntent={...authorization,authorizationSignature,memo:`edgeswarm:v1:${id}:${intentId}:${evidenceHash}`,status:'PREPARED',signature:null};
 engine.event(id,'DEVNET_INTENT_PREPARED',{intentId});engine.save();return structuredClone(job.solanaIntent);
}
export function unsignedPaymentTransaction(intent,{blockhash,lastValidBlockHeight},now=Date.now()){
 if(intent.cluster!=='devnet'||intent.lamports!==PAYMENT_LAMPORTS)throw Error('Unsupported payment policy');
 if(intent.status!=='PREPARED'||intent.signature)throw Error('Payment already submitted; reconcile instead of sending again');
 if(intent.expiresAt<=now)throw Error('Payment intent expired; create a new job');
 const payer=new PublicKey(intent.payer);
 const transaction=new Transaction({feePayer:payer,blockhash,lastValidBlockHeight}).add(
  SystemProgram.transfer({fromPubkey:payer,toPubkey:new PublicKey(intent.recipient),lamports:intent.lamports}),
  new TransactionInstruction({programId:new PublicKey(MEMO_PROGRAM),keys:[{pubkey:payer,isSigner:true,isWritable:false}],data:Buffer.from(intent.memo,'utf8')})
 );
 return transaction.serialize({requireAllSignatures:false,verifySignatures:false}).toString('base64');
}
export function markPaymentSubmitted(engine,id,signature){
 if(typeof signature!=='string'||!SIGNATURE.test(signature))throw Error('Invalid transaction signature');
 const job=engine.get(id);const intent=job?.solanaIntent;if(!intent)throw Error('Prepare a payment intent first');
 if(intent.signature&&intent.signature!==signature)throw Error('A different signature is already bound to this intent');
 intent.signature=signature;if(intent.status!=='CONFIRMED')intent.status='SUBMITTED';engine.save();return structuredClone(intent);
}
const keyString=value=>typeof value==='string'?value:value?.toBase58?.();
export function validateDevnetTransaction(intent,tx,status,{genesisHash,signature}={}){
 if(genesisHash!==DEVNET_GENESIS)throw Error('RPC is not Solana Devnet');
 if(!SIGNATURE.test(signature??'')||signature!==intent.signature)throw Error('Signature does not match stored intent');
 if(!status||status.err||!['confirmed','finalized'].includes(status.confirmationStatus))throw Error('Transaction not confirmed on Devnet yet');
 if(!tx||!tx.meta||tx.meta.err)throw Error('Transaction missing or failed on Devnet');
 if(tx.transaction?.signatures?.[0]!==signature)throw Error('RPC transaction signature mismatch');
 if(!Number.isFinite(tx.blockTime)||tx.blockTime*1000<intent.createdAt-60000||tx.blockTime*1000>intent.expiresAt+60000)throw Error('Transaction is outside intent validity window');
 const message=tx.transaction.message;if(!intent.transaction?.blockhash||message.recentBlockhash!==intent.transaction.blockhash)throw Error('Transaction blockhash does not match prepared payment');const accounts=message.accountKeys;
 if(!accounts?.length||keyString(accounts[0].pubkey)!==intent.payer||!accounts[0].signer)throw Error('Wrong transaction payer');
 const instructions=message.instructions;
 if(!Array.isArray(instructions)||instructions.length>8)throw Error('Unexpected transaction instructions');
 const transfers=instructions.filter(i=>keyString(i.programId)===SystemProgram.programId.toBase58());
 const memos=instructions.filter(i=>keyString(i.programId)===MEMO_PROGRAM);
 if(transfers.length!==1||memos.length!==1)throw Error('Expected exactly one transfer and one bound memo');
 if(instructions.some(i=>![SystemProgram.programId.toBase58(),MEMO_PROGRAM,COMPUTE_BUDGET_PROGRAM].includes(keyString(i.programId))))throw Error('Unexpected program in payment transaction');
 if(tx.meta.innerInstructions?.some(group=>group.instructions?.length))throw Error('Unexpected inner instructions');
 const transfer=transfers[0].parsed;
 if(transfer?.type!=='transfer'||transfer.info?.source!==intent.payer||transfer.info?.destination!==intent.recipient||transfer.info?.lamports!==intent.lamports)throw Error('Transfer recipient, payer or amount does not match intent');
 if(memos[0].parsed!==intent.memo)throw Error('Memo does not bind this job evidence');
 const recipientIndex=accounts.findIndex(a=>keyString(a.pubkey)===intent.recipient);
 const received=tx.meta.postBalances?.[recipientIndex]-tx.meta.preBalances?.[recipientIndex];
 if(recipientIndex<0||received!==intent.lamports)throw Error('Recipient balance delta does not match payment');
 const spent=tx.meta.preBalances?.[0]-tx.meta.postBalances?.[0];
 if(!Number.isSafeInteger(tx.meta.fee)||spent!==intent.lamports+tx.meta.fee)throw Error('Payer balance delta does not match payment and fee');
 return {cluster:'devnet',signature,slot:tx.slot,blockTime:tx.blockTime,confirmationStatus:status.confirmationStatus,payer:intent.payer,recipient:intent.recipient,lamports:intent.lamports,memo:intent.memo,evidenceHash:intent.evidenceHash,jobId:intent.jobId,intentId:intent.intentId,explorer:`https://explorer.solana.com/tx/${signature}?cluster=devnet`,verification:'SERVER_RPC_CHECKED',escrow:false};
}
export function confirmPaymentReceipt(engine,id,receipt){
 const job=assertJobEvidence(engine,id,{fresh:false});const intent=job.solanaIntent;
 if(!intent||intent.signature!==receipt.signature||intent.intentId!==receipt.intentId||intent.evidenceHash!==receipt.evidenceHash||intent.payer!==receipt.payer||intent.recipient!==receipt.recipient||intent.lamports!==receipt.lamports||receipt.cluster!=='devnet')throw Error('Receipt does not match stored intent');
 if(intent.status==='CONFIRMED')return structuredClone(intent);
 intent.status='CONFIRMED';intent.receipt={...receipt,checkedAt:new Date(engine.now()).toISOString()};
 engine.event(id,'DEVNET_PAYMENT_CONFIRMED',{signature:receipt.signature});engine.save();return structuredClone(intent);
}
