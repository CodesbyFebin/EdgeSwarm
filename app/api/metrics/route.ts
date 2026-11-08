import {NextResponse} from 'next/server';import {engine} from '../../../lib/engine.mjs';export const runtime='nodejs';export async function GET(){return NextResponse.json(engine.metrics())}
