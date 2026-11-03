import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleRequest } from '../src/server.ts';
import { getDb } from '../src/db/database.ts';
import { runSeed } from '../src/db/seed.ts';

let isInitialized = false;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!isInitialized) {
    try {
      const db = getDb();
      const check = db.prepare('SELECT count(*) as count FROM categories').get() as { count: number };
      if (!check || check.count === 0) {
        runSeed();
      }
    } catch {
      try {
        runSeed();
      } catch (err) {
        console.warn('[Vercel] Error during auto-seeding:', err);
      }
    }
    isInitialized = true;
  }
  return handleRequest(req, res);
}
