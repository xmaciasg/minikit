import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { recipients, transactions, agents } from './schema';
import path from 'path';
import fs from 'fs';

// Usar /data para volúmenes persistentes en Railway, o ./ en local
const dataDir = process.env.DATA_DIR || '.';
const dbPath = path.join(dataDir, 'sqlite.db');

// Crear directorio si no existe
if (!fs.existsSync(dataDir) && dataDir !== '.') {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema: { recipients, transactions, agents } });