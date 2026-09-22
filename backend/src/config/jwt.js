import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'national-land-acq-secret-key-2026-rfctlarr';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export { JWT_SECRET, JWT_EXPIRES_IN };
