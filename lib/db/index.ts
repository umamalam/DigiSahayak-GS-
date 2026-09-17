import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const envDbPath = process.env.DATABASE_PATH || 'sqlite.db';

function resolveDbPath(): string {
  try {
    const dir = path.dirname(envDbPath);
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
    }
    return envDbPath;
  } catch {
    // Falls back to a local file when the configured directory can't be
    // created or written to (e.g. Render's build step, where the real
    // persistent disk isn't mounted yet). At actual runtime the disk is
    // attached and this fallback won't be needed.
    return 'sqlite.db';
  }
}

const sqlite = new Database(resolveDbPath());
export const db = drizzle(sqlite, { schema });
