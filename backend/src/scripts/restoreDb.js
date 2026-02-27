import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

async function main() {
  const source = process.argv[2];
  if (!source) {
    console.error('Usage: npm --prefix backend run db:restore -- /absolute/or/relative/path/to/backup.sqlite');
    process.exit(1);
  }

  const resolvedSource = path.resolve(source);
  await fs.access(resolvedSource);

  const dbPath = env.dbPath;
  try {
    await fs.access(dbPath);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rollbackPath = `${dbPath}.${stamp}.pre-restore`;
    await fs.copyFile(dbPath, rollbackPath);
    console.log(`Current DB snapshot created: ${rollbackPath}`);
  } catch {
    // No existing db yet
  }

  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.copyFile(resolvedSource, dbPath);
  console.log(`Database restored from: ${resolvedSource}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
