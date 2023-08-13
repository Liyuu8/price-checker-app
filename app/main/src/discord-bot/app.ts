import { Firestore } from '@google-cloud/firestore';
import { Client, IntentsBitField } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { getData } from '../lib/scraper';

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});
const firestore = new Firestore();

client.on('ready', () => console.log('App is started'));

client.on('messageCreate', async (message) => {
  const content = message.content;
  content === 'ping' && message.channel.send('pong');

  const regExp = /add_price:(.+)/;
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
    const response = `Registered! Title:${result.data.name} Price:${result.data.price}`;
    console.log(response);
    message.channel.send(response);
  } catch (e: any) {
    console.log(e);
    message.channel.send(e.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
