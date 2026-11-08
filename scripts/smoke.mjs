import assert from 'node:assert/strict';
const base=process.env.BASE_URL??'http://127.0.0.1:3100';
async function session(){const r=await fetch(base+'/api/jobs');assert.equal(r.status,200);return r.headers.get('set-cookie')?.split(';')[0]??''}
const a=await session(), b=await session();assert.ok(a&&b&&a!==b);
const call=async(path,cookie=a,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{cookie,origin:new URL(base).origin,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()}};
const created=await call('/api/jobs',a,{title:'Smoke verification',input:'hello edgeswarm',reward:50});assert.equal(created.status,201);
const id=created.data.id;const other=await call('/api/jobs/'+id,b);assert.equal(other.status,404);
const settled=await call('/api/jobs/'+id,a,{action:'process'});assert.equal(settled.data.status,'SETTLED');
assert.equal((await call('/api/jobs/'+id,a,{action:'settle'})).data.status,'SETTLED');
assert.equal((await call('/api/metrics')).data.settled,50);assert.equal((await call('/api/metrics',b)).data.settled,0);
const bad=await call('/api/jobs',a,{title:'Tamper smoke job',input:'reject me'});
assert.equal((await call('/api/jobs/'+bad.data.id,a,{action:'process',tamper:true})).data.status,'REJECTED');
assert.equal((await call('/api/metrics')).data.settled,50);
const cross=await fetch(base+'/api/jobs',{method:'POST',headers:{origin:'https://attacker.invalid','content-type':'application/json'},body:'{}'});assert.equal(cross.status,403);
for(const path of ['/','/mobile','/devnet-demo','/api/health']){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.equal(r.headers.get('x-content-type-options'),'nosniff')}
console.log('PASS: production routes, per-session isolation, real signed execution, idempotent simulated settlement, tamper rejection, same-origin enforcement and headers');
