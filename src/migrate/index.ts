import process from 'process';
import { Migrate } from "./migrate";

async function main() {
  const migrate = new Migrate();
  try {
    await migrate.run();
  } finally {
    await migrate.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
