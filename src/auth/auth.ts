// Workdone Authentication & Security Module
import * as crypto from 'node:crypto';
import { queryOne, execute } from '../db/database.ts';
import type { User, SessionData, UserRole } from '../types/index.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'workdone_secret_key_change_in_production_min32chars';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Salted cryptographic password hashing using scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Generate signed session cookie
export function createSessionToken(session: SessionData): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const sessionJson = Buffer.from(payload, 'base64url').toString('utf8');
    const session: SessionData = JSON.parse(sessionJson);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null; // Expired
    }
    return session;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      const key = pair.substring(0, idx).trim();
      const val = pair.substring(idx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

export function serializeCookie(name: string, val: string, maxAgeSeconds: number = 7 * 86400): string {
  return `${name}=${encodeURIComponent(val)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax`;
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

// Input sanitization and validation
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim();
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  return { valid: true };
}

// Audit logging helper
export function logAuditEvent(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>,
  ipAddress?: string
): void {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const detailsStr = details ? JSON.stringify(details) : null;
    execute(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, action, entityType, entityId, detailsStr, ipAddress || '127.0.0.1', now]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}
