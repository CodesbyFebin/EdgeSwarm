import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

/**
 * The in-memory task engine is a single-operator prototype.
 * Production endpoints are closed unless an operator configures an API key.
 * This does not replace identity, rate limiting, or durable storage.
 */
export function requireOperator(request: Request): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null;
  const expected = process.env.EDGESWARM_OPERATOR_API_KEY;
  if (!expected || expected.length < 32) {
    return NextResponse.json({ error: 'Jobs API disabled: configure a 32+ character EDGESWARM_OPERATOR_API_KEY for operator-only access.' }, { status: 503 });
  }
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } });
  }
  return null;
}
