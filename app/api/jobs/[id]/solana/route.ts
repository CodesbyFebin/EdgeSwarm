import {NextResponse} from 'next/server';
import {withEngine} from '../../../../../lib/engine.mjs';
import {readJson} from '../../../../../lib/http.mjs';
import {preparePaymentIntent,unsignedPaymentTransaction,markPaymentSubmitted,validateDevnetTransaction,confirmPaymentReceipt} from '../../../../../lib/solana-payments.mjs';
import {devnetBlockhash,devnetTransaction} from '../../../../../lib/solana-rpc.mjs';
export const runtime='nodejs';
export const maxDuration=30;
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Context){try{const {id}=await params;return await withEngine((engine:any)=>{const job=engine.get(id);return job?NextResponse.json({intent:job.solanaIntent??null}):NextResponse.json({error:'Not found'},{status:404})})}catch{return NextResponse.json({error:'Demo storage unavailable'},{status:503})}}
export async function POST(request:Request,{params}:Context){try{
 const {id}=await params;const data=await readJson(request);
 if(data.action==='prepare'){
  const intent=await withEngine((engine:any)=>preparePaymentIntent(engine,id,{payer:data.payer,recipient:data.recipient}),{write:true});
  if(intent.status!=='PREPARED')return NextResponse.json({intent});
  const blockhash=intent.transaction??await devnetBlockhash();
  return await withEngine((engine:any)=>{const current=preparePaymentIntent(engine,id,{payer:data.payer,recipient:data.recipient});if(current.status!=='PREPARED')return NextResponse.json({intent:current});if(!current.transaction){const base64=unsignedPaymentTransaction(current,blockhash);engine.get(id).solanaIntent.transaction={base64,...blockhash};engine.save()}return NextResponse.json({intent:engine.get(id).solanaIntent})},{write:true});
 }
 if(data.action==='confirm'){
  const intent=await withEngine((engine:any)=>markPaymentSubmitted(engine,id,data.signature),{write:true});
  if(intent.status==='CONFIRMED')return NextResponse.json({intent});
  const rpc=await devnetTransaction(data.signature);
  const receipt=validateDevnetTransaction(intent,rpc.transaction,rpc.status,{genesisHash:rpc.genesisHash,signature:data.signature});
  return await withEngine((engine:any)=>NextResponse.json({intent:confirmPaymentReceipt(engine,id,receipt)}),{write:true});
 }
 return NextResponse.json({error:'Unknown Solana action'},{status:400});
}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Payment request failed'},{status:400})}}
