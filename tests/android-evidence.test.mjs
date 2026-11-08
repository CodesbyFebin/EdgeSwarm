import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { sha256Utf8, verifyAndroidLocalEvidence } from '../lib/android-evidence-verifier.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pub = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
const input = 'hello edgeswarm';
const evidence = {
  version: 'edgeswarm-android-local-v1', mode: 'LOCAL_DEMO',
  taskType: 'uppercase', signatureAlgorithm: 'SHA256withECDSA_P256',
  jobId: '12345678-1234-4234-8234-123456789abc',
  taskHash: sha256Utf8(input), output: input.toUpperCase(),
  resultHash: sha256Utf8(input.toUpperCase()), publicKeySpkiBase64: pub
};
const bytes = Buffer.from('EDGESWARM_ANDROID_LOCAL_V1\n' + evidence.jobId + '\n' + evidence.taskHash + '\n' + evidence.resultHash);
evidence.signatureBase64 = sign('sha256', bytes, privateKey).toString('base64');
const check = (e, opts = {}) => verifyAndroidLocalEvidence(e, { input, allowedPublicKeys: new Set([pub]), ...opts });

test('P-256 Android wire format signature and replay pass', () => {
  assert.deepEqual(check(evidence), { valid: true, evidenceLevel: 'LOCAL_SIGNATURE_AND_REPLAY', settlementEligible: false });
});
test('unregistered public key fails', () => assert.equal(check(evidence, { allowedPublicKeys: new Set() }).valid, false));
test('tampered signature fails', () => assert.equal(check({ ...evidence, signatureBase64: sign('sha256', Buffer.from('other'), privateKey).toString('base64') }).valid, false));
test('tampered output fails', () => assert.equal(check({ ...evidence, output: 'FAKE' }).valid, false));
test('tampered hash fails', () => assert.equal(check({ ...evidence, taskHash: '0'.repeat(64) }).valid, false));
test('different input fails', () => assert.equal(check(evidence, { input: 'different' }).valid, false));
test('local evidence never authorizes payment', () => assert.equal(check(evidence).settlementEligible, false));
