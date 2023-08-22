import { exit } from 'process';
import { runChecker } from './checker';
import { log } from 'console';

(async () => {
  try {
    if (!process.env.CHECKER_SITE)
      throw new Error('Env [CHECKER_SITE] undefined.');

    const result = await runChecker(process.env.CHECKER_SITE);
    if (!result.result) throw new Error(result.message);

    log(result);
    exit(0);
  } catch (e) {
    log(e);
    exit(1);
  }
})();
