import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {postgresQueryFromEnv,usePostgresEngine} from '../lib/postgres-store.mjs';
const query=postgresQueryFromEnv();const id=randomUUID();
const job=await usePostgresEngine(query,id,e=>e.create({title:'Postgres integration',input:'across instances'}));
await usePostgresEngine(query,id,e=>e.execute(job.id));await usePostgresEngine(query,id,e=>e.verify(job.id));
const outcomes=await Promise.all([1,2].map(()=>usePostgresEngine(query,id,e=>e.settle(job.id))));assert.ok(outcomes.every(j=>j.status==='SETTLED'));
await usePostgresEngine(query,id,e=>{assert.equal(e.state.payments.length,1);assert.equal(e.metrics().settled,50)});
await usePostgresEngine(query,randomUUID(),e=>assert.equal(e.state.jobs.length,0));
console.log('PASS: PostgreSQL persistence, restored signing keys across calls, concurrent idempotent settlement and session isolation');
