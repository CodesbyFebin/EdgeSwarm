import {NextResponse} from 'next/server';
import {withEngine} from '../../../lib/engine.mjs';
import {readJson} from '../../../lib/http.mjs';
export const runtime='nodejs';
export async function GET(){try{return await withEngine((engine:any)=>NextResponse.json({jobs:engine.state.jobs}))}catch{return NextResponse.json({error:'Demo storage unavailable or request limit reached'},{status:503})}}
export async function POST(request:Request){try{const data=await readJson(request);return await withEngine((engine:any)=>NextResponse.json(engine.create(data),{status:201}),{write:true})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Request failed'},{status:400})}}
