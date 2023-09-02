import { log } from 'console';
import { getData } from '../lib/scraper';

const argv = process.argv.slice(2);

(async () => log(await getData(argv[0])))();
