import {Engine} from './core.mjs';
import {postgresQueryFromEnv,usePostgresEngine} from './postgres-store.mjs';
import {cookies} from 'next/headers';
const sessions=globalThis.__edgeswarmSessions??(globalThis.__edgeswarmSessions=new Map());
const TTL=30*60*1000;
// Disposable per-browser demo state: never use for durable jobs or real funds.
export async function withEngine(operation,{write=false}={}){
 const id=(await cookies()).get('edgeswarm-session')?.value;
 if(!id||!/^[0-9a-f-]{36}$/.test(id))throw Error('Missing demo session; reload the page');
 if(process.env.VERCEL||process.env.DATABASE_URL||process.env.POSTGRES_URL)return usePostgresEngine(postgresQueryFromEnv(),id,operation);
 const now=Date.now();
 for(const [key,value] of sessions)if(value.expires<=now)sessions.delete(key);
 let session=sessions.get(id);
 if(!session){if(sessions.size>=250)throw Error('Demo capacity reached; try later');session={engine:new Engine(),expires:now+TTL,window:now,count:0};sessions.set(id,session)}
 if(now-session.window>=60000){session.window=now;session.count=0}
 if(++session.count>120)throw Error('Session request limit reached; retry in one minute');
 return operation(session.engine);
}
