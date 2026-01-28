import { defineConfig } from 'drizzle-kit';
import path from 'path';

// Usar /data para volúmenes persistentes en Railway, o ./ en local
const dataDir = process.env.DATA_DIR || '.';
const dbPath = path.join(dataDir, 'sqlite.db');

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath,
  },
});