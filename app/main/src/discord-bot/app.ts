import { Firestore } from '@google-cloud/firestore';
import { Client, IntentsBitField } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { getData } from '../lib/scraper';
import { log } from 'console';

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});
const firestore = new Firestore();

client.on('ready', () => log('App is started'));

client.on('messageCreate', async (message) => {
  const content = message.content;
  content === 'ping' && message.channel.send('pong');

  const regExp = /add_price: (.+)/;
  const regExpResultList = regExp.exec(content);
  if (
    !(regExp.test(content) && regExpResultList && regExpResultList?.length >= 2)
  )
    return;

  try {
    const url = regExpResultList[1];
    const result = await getData(url);
    if (!result.result || !result.data) throw new Error(result.message);

    const collection = firestore.collection('price_checker');
    await collection.doc(uuidv4()).set(result.data);
    const response = `Registered!\n\`\`\`Title: ${result.data.name}\n\nPrice: ${result.data.price}\`\`\``;
    log(response);
    message.channel.send(response);
  } catch (e: any) {
    log(e);
    message.channel.send(e.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
