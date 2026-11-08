import test from 'node:test';import assert from 'node:assert/strict';import {Engine,digest,canonical} from '../lib/core.mjs';
test('canonical sorting',()=>assert.equal(canonical({z:1,a:{b:2,a:3}}),'{"a":{"a":3,"b":2},"z":1}'));
test('valid job verifies and settles',()=>{const e=new Engine();const j=e.create({title:'test job',input:'abc'});assert.equal(e.process(j.id).status,'SETTLED');assert.equal(e.metrics().settled,50)});
test('tampered output rejected',()=>{const e=new Engine();const j=e.create({title:'test job',input:'abc'});assert.equal(e.process(j.id,{tamper:true}).status,'REJECTED');assert.equal(e.metrics().settled,0)});
test('wrong worker rejected',()=>{const e=new Engine();const j=e.create({title:'test job',input:'abc'});e.execute(j.id,{wrongWorker:true});assert.equal(e.verify(j.id).status,'REJECTED')});
test('expired assignment rejected',()=>{const e=new Engine();const j=e.create({title:'test job',input:'abc'});e.execute(j.id,{expired:true});assert.equal(e.verify(j.id).status,'REJECTED')});
test('duplicate execution blocked',()=>{const e=new Engine();const j=e.create({title:'test job',input:'abc'});e.execute(j.id);assert.throws(()=>e.execute(j.id))});
test('insufficient budget blocked',()=>{const e=new Engine();e.state.totalBudget=0;const j=e.create({title:'test job',input:'abc'});e.execute(j.id);e.verify(j.id);assert.throws(()=>e.settle(j.id),/Insufficient/)});
test('invalid inputs rejected',()=>{const e=new Engine();assert.throws(()=>e.create({title:'x',input:'abc'}));assert.throws(()=>e.create({title:'valid',input:'',reward:50}))});
test('digest matches SHA256 known vector',()=>assert.equal(digest('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'))