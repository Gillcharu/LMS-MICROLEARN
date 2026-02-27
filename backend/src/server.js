import app from './app.js';
import { env } from './config/env.js';
import { initDb } from './models/index.js';

async function main() {
  await initDb();
  app.listen(env.port, () => {
    console.log(`MicroLearn API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
