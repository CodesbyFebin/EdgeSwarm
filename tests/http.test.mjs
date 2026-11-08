import test from 'node:test';import assert from 'node:assert/strict';import {readJson} from '../lib/http.mjs';
const req=(body,type='application/json')=>new Request('http://localhost',{method:'POST',headers:{'content-type':type},body});
test('valid JSON object accepted',async()=>assert.deepEqual(await readJson(req('{"input":"hello"}')),{input:'hello'}));
test('arrays rejected',async()=>assert.rejects(readJson(req('[]')),/object/));
test('null rejected',async()=>assert.rejects(readJson(req('null')),/object/));
test('wrong media type rejected',async()=>assert.rejects(readJson(req('{}','text/plain')),/application\/json/));
test('oversized body rejected',async()=>assert.rejects(readJson(req(JSON.stringify({input:'x'.repeat(65536)}))),/64 KiB/));
test('malformed JSON rejected',async()=>assert.rejects(readJson(req('{'))));
