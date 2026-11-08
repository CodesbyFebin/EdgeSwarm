import {NextResponse} from 'next/server';
import {withEngine} from '../../../../lib/engine.mjs';
import {readJson} from '../../../../lib/http.mjs';
export const runtime='nodejs';
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Context){const {id}=await params;try{return await withEngine((engine:any)=>{const job=engine.get(id);return job?NextResponse.json(job):NextResponse.json({error:'Not found'},{status:404})})}catch{return NextResponse.json({error:'Demo storage unavailable or request limit reached'},{status:503})}}
export async function POST(request:Request,{params}:Context){try{const {id}=await params;const data=await readJson(request);return await withEngine((engine:any)=>{if(!engine.get(id))return NextResponse.json({error:'Not found'},{status:404});const job=data.action==='process'?engine.process(id,{tamper:data.tamper===true}):data.action==='execute'?engine.execute(id):data.action==='verify'?engine.verify(id):data.action==='settle'?engine.settle(id):null;if(!job)throw Error('Unknown action');return NextResponse.json(job)},{write:true})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Request failed'},{status:400})}}
