import { Firestore } from '@google-cloud/firestore';
import { App } from '@slack/bolt';
import { v4 as uuidv4 } from 'uuid';
import { getData } from '../lib/scraper';
import { log } from 'console';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const firestore = new Firestore();

app.message('ping', async ({ say }) => {
  await say('pong');
});

app.message(/add_price: (.+)/, async ({ say, context }) => {
  try {
    const url = context.matches[1].slice(1).slice(0, -1).split('|')[0];
    const result = await getData(url);
    if (!result.result || !result.data) throw new Error(result.message);

    const collection = firestore.collection('price_checker');
    await collection.doc(uuidv4()).set(result.data);
    const response = `Registered!\n\`\`\`Title: ${result.data.name}\n\nPrice: ${result.data.price}\`\`\``;
    log(response);
    await say(response);
  } catch (e: any) {
    log(e);
    await say(e.message);
  }
});

(async () => {
  log('App is started');
  await app.start(process.env.PORT || 3000);
})();
