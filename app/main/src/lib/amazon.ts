import axios from 'axios';
import { JSDOM } from 'jsdom';

export const getAmazon = async (url: string) => {
  try {
    const resp = await axios.get(url);
    const domBody = new JSDOM(resp.data);
    const document = domBody.window.document;

    const name =
      document
        .querySelector('span#productTitle')
        ?.textContent?.replace(/(?:\r\n|\r|\n)/g, '')
        .trimStart() ?? '';

    const priceBlocks = [
      'span#priceblock_dealprice',
      'span#priceblock_ourprice',
      'span#price',
      'span#kindle-price',
      'span#priceblock_saleprice',
      'span.a-price-whole',
    ];

    const price =
      priceBlocks
        .map((block) => {
          const priceStr = document
            .querySelector(block)
            ?.textContent?.replace(/[^0-9]/g, '');
          return priceStr ? parseInt(priceStr) : undefined;
        })
        .find((price) => !!price) ?? 0;

    return {
      result: true,
      message: 'success!!',
      data: {
        target: url,
        site: 'amazon.co.jp',
        name,
        price,
      },
    };
  } catch (e: any) {
    return {
      result: false,
      message: e.message as string,
      data: null,
    };
  }
};
