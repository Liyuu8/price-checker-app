import { Firestore } from '@google-cloud/firestore';
import { Client, IntentsBitField, TextChannel } from 'discord.js';
import { getData } from '../lib/scraper';
import { log } from 'console';

export const runChecker = async (site: string) => {
  const firestore = new Firestore();
  const discordClient = new Client({ intents: [IntentsBitField.Flags.Guilds] });

  try {
    const collection = firestore.collection('price_checker');
    const dataRef = await collection.where('site', '==', site).get();
    if (dataRef.empty) return { result: true, message: 'no data' };

    const channelId = process.env.NOTICE_DISCORD_CHANNEL;
    const token = process.env.DISCORD_TOKEN;
    if (!token || !channelId)
      return { result: false, message: 'token or channel id not found' };
    await discordClient.login(token);
    const channel = await discordClient.channels.fetch(channelId);

    await Promise.all(
      dataRef.docs.map(async (doc) => {
        const currentData = doc.data();
        const currentLog = `Title: ${currentData.name} Price: ${currentData.price}`;
        log('[currentLog]', currentLog);

        const newData = await getData(currentData.target);
        if (!newData.result || !newData.data) {
          log(`Failed ${currentLog}`);
          return;
        }

        const newLog = `${currentLog} => ${newData.data.price}`;
        log(newLog);

        if (currentData.price !== newData.data.price) {
          const chatMessage = `Price changed! ${newLog} Target: ${newData.data.target}`;
          channel && (channel as TextChannel).send(chatMessage);
          await collection.doc(doc.id).set(newData.data);
        }
      })
    );

    return { result: true, message: 'success!!' };
  } catch (e: any) {
    log(e);

    return { result: false, message: e.message as string };
  }
};
