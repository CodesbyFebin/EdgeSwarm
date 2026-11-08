import {NextResponse} from 'next/server';
import {engine} from '../../../lib/engine.mjs';
import {requireOperator} from '../../../lib/api-access';
export const runtime='nodejs';
export async function GET(request:Request){const denied=requireOperator(request);if(denied)return denied;return NextResponse.json(engine.metrics())}
