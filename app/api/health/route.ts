import {NextResponse} from 'next/server';export async function GET(){return NextResponse.json({ok:true,environment:'LOCAL_DEMO',settlement:'SIMULATED',realSolana:false,authentication:false})}
