import {neon} from '@neondatabase/serverless';
import {Engine} from './core.mjs';
const schema=`CREATE TABLE IF NOT EXISTS edgeswarm_demo_sessions (id text PRIMARY KEY, snapshot jsonb NOT NULL, revision integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL DEFAULT (now()+interval '30 minutes'), rate_window bigint NOT NULL DEFAULT 0, rate_count integer NOT NULL DEFAULT 0)`;
let initialized;
export function postgresQueryFromEnv(env=process.env){const url=env.DATABASE_URL??env.POSTGRES_URL;if(!url)throw Error('PostgreSQL storage is not configured');const sql=neon(url);return (text,params=[])=>sql.query(text,params)}
export async function usePostgresEngine(query,id,operation){
 if(!initialized){initialized=query(schema).catch(error=>{initialized=undefined;throw error})}await initialized;
 // Expiring demo records contain private signing keys; never return them to clients.
 await query('DELETE FROM edgeswarm_demo_sessions WHERE expires_at < now()');
 await query('INSERT INTO edgeswarm_demo_sessions (id,snapshot) VALUES ($1,$2::jsonb) ON CONFLICT (id) DO NOTHING',[id,JSON.stringify(new Engine().snapshot())]);
 for(let attempt=0;attempt<5;attempt++){
  const rows=await query('SELECT snapshot,revision,rate_window,rate_count FROM edgeswarm_demo_sessions WHERE id=$1 AND expires_at>now()',[id]);
  if(!rows.length)throw Error('Demo session expired; reload the page');
  const row=rows[0];const window=Math.floor(Date.now()/60000);const count=Number(row.rate_window)===window?row.rate_count+1:1;
  if(count>120)throw Error('Session request limit reached; retry in one minute');
  const engine=Engine.restore(row.snapshot);const result=operation(engine);
  const updated=await query('UPDATE edgeswarm_demo_sessions SET snapshot=$1::jsonb,revision=revision+1,rate_window=$2,rate_count=$3 WHERE id=$4 AND revision=$5 AND expires_at>now() RETURNING revision',[JSON.stringify(engine.snapshot()),window,count,id,row.revision]);
  if(updated.length)return result;
 }
 throw Error('Concurrent update conflict; retry the request');
}
