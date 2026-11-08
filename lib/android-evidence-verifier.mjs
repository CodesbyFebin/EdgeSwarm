import { createHash, createPublicKey, verify, createECDH } from 'node:crypto';

const PREFIX = 'EDGESWARM_ANDROID_LOCAL_V1\n';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX = /^[a-f0-9]{64}$/i;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export function sha256Utf8(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
function decodeBase64(value) {
  if (typeof value !== 'string' || !BASE64.test(value) || value.length > 2048) throw Error('INVALID_BASE64');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw Error('NONCANONICAL_BASE64');
  return bytes;
}
/**
 * Verify exported LOCAL_DEMO Android evidence against an independently supplied
 * trusted input and an allowlisted public key. Never authorize settlement with
 * this local format: it lacks assignment, nonce, expiry, and policy binding.
 */
export function verifyAndroidLocalEvidence(evidence, { input, allowedPublicKeys }) {
  try {
    if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) throw Error('INVALID_EVIDENCE');
    if (typeof input !== 'string' || input.length < 1 || input.length > 10000) throw Error('INVALID_INPUT');
    if (!(allowedPublicKeys instanceof Set)) throw Error('MISSING_KEY_REGISTRY');
    if (evidence.version !== 'edgeswarm-android-local-v1' ||
        evidence.mode !== 'LOCAL_DEMO' ||
        evidence.taskType !== 'uppercase' ||
        evidence.signatureAlgorithm !== 'SHA256withECDSA_P256' ||
        !UUID.test(evidence.jobId) ||
        !HEX.test(evidence.taskHash) || !HEX.test(evidence.resultHash)) throw Error('INVALID_FIELDS');
    if (!allowedPublicKeys.has(evidence.publicKeySpkiBase64)) throw Error('UNREGISTERED_WORKER');
    if (evidence.taskHash !== sha256Utf8(input)) throw Error('INPUT_HASH_MISMATCH');
    const expectedOutput = input.toUpperCase();
    if (evidence.output !== expectedOutput ||
        evidence.resultHash !== sha256Utf8(expectedOutput)) throw Error('RESULT_MISMATCH');
    const key = createPublicKey({ key: decodeBase64(evidence.publicKeySpkiBase64), format: 'der', type: 'spki' });
    if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') throw Error('WRONG_KEY_TYPE');
    const message = Buffer.from(PREFIX + evidence.jobId + '\n' + evidence.taskHash + '\n' + evidence.resultHash, 'utf8');
    if (!verify('sha256', message, key, decodeBase64(evidence.signatureBase64))) throw Error('INVALID_SIGNATURE');
    return { valid: true, evidenceLevel: 'LOCAL_SIGNATURE_AND_REPLAY', settlementEligible: false };
  } catch (error) {
    return { valid: false, reason: error.message, settlementEligible: false };
  }
}
