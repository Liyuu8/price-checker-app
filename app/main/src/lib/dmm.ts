import axios from 'axios';
import 'dotenv/config';

const regex = /\/detail\/(=\/(title_id|cid)=(.*)|(.*))\//g;

export const getDmm = async (url: string) => {
  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;
  const failed = (message: string) => ({ result: false, message, data: null });

  if (!apiId || !affiliateId) return failed('API or affiliate id not found');

  const results = [...url.matchAll(regex)];
  if (results.length <= 0) return failed('url parse failed (matchAll)');

  const cid = [results[0][3], results[0][4]].find(
    (result) => typeof result !== 'undefined'
  );
  if (!cid) return failed('url parse failed (regex group not found)');

  const isDmm = url.indexOf('dmm.co.jp') === -1;
  const site = isDmm ? 'DMM.com' : 'FANZA';

  try {
    const fetch = await axios.get(
      `https://api.dmm.com/affiliate/v3/ItemList?api_id=${apiId}&affiliate_id=${affiliateId}&site=${site}&cid=${cid}`
    );
    const item = fetch.data.result.items[0];

    return {
      result: true,
      message: 'success!!',
      data: {
        target: url,
        site,
        name: item.title as string,
        price: parseInt(item.prices.price),
      },
    };
  } catch (e: any) {
    return failed(JSON.stringify(e.response.data.result));
  }
};
