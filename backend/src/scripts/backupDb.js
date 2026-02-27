import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

async function main() {
  const dbPath = env.dbPath;
  const backupDir = path.resolve(path.dirname(dbPath), '..', 'backups');
  await fs.mkdir(backupDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `microlearn-${stamp}.sqlite`);
  await fs.copyFile(dbPath, backupPath);

  console.log(`Backup created: ${backupPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
