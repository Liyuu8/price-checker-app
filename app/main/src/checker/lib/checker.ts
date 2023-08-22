import { Firestore } from '@google-cloud/firestore';
import { WebClient } from '@slack/web-api';
import { Client, IntentsBitField, TextChannel } from 'discord.js';
import { getData } from '../../lib/scraper';
import { log } from 'console';

export const runChecker = async (site: string) => {
  const firestore = new Firestore();
  const slackCliend = new WebClient();
  const discordClient = new Client({ intents: [IntentsBitField.Flags.Guilds] });

  try {
    const collection = firestore.collection('price_checker');
    const dataRef = await collection.where('site', '==', site).get();
    if (dataRef.empty) return { result: true, message: 'no data' };

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

          if (process.env.NOTICE_SLACK_CHANNEL) {
            await slackCliend.chat.postMessage({
              token: process.env.NOTICE_SLACK_TOKEN,
              channel: process.env.NOTICE_SLACK_CHANNEL,
              text: chatMessage,
            });
          }
          if (process.env.NOTICE_DISCORD_CHANNEL) {
            await discordClient.login(process.env.NOTICE_DISCORD_TOKEN);
            const channel = await discordClient.channels.fetch(
              process.env.NOTICE_DISCORD_CHANNEL
            );
            channel && (channel as TextChannel).send(chatMessage);
          }

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
