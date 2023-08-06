import { getData } from './lib/scraper';

const argv = process.argv.slice(2);
(async () => console.log(await getData(argv[0])))();
