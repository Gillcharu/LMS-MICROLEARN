import { initDb } from '../models/index.js';

async function main() {
  await initDb();
  console.log('Schema sync complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
