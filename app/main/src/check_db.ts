import { log } from 'console';
import { runChecker } from './checker/lib/checker';

const argv = process.argv.slice(2);

(async () => {
  log(await runChecker(argv[0]));
  process.exit(0);
})();
