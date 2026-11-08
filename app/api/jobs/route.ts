import {NextResponse} from 'next/server';
import {engine} from '../../../lib/engine.mjs';
export const runtime='nodejs';
export async function GET(){return NextResponse.json({jobs:engine.state.jobs})}
export async function POST(request:Request){try{return NextResponse.json(engine.create(await request.json()),{status:201})}catch(e){return NextResponse.json({error:String(e instanceof Error?e.message:e)},{status:400})}}
