import {NextResponse} from 'next/server';
import {engine} from '../../../../lib/engine.mjs';
import {requireOperator} from '../../../../lib/api-access';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const denied=requireOperator(request);if(denied)return denied;const {id}=await params;const job=engine.get(id);return job?NextResponse.json(job):NextResponse.json({error:'Not found'},{status:404})}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){const denied=requireOperator(request);if(denied)return denied;try{const {id}=await params;const data=await request.json();const job=data.action==='process'?engine.process(id,{tamper:data.tamper===true}):data.action==='execute'?engine.execute(id):data.action==='verify'?engine.verify(id):data.action==='settle'?engine.settle(id):null;if(!job)throw Error('Unknown action');return NextResponse.json(job)}catch(e){return NextResponse.json({error:String(e instanceof Error?e.message:e)},{status:400})}}
