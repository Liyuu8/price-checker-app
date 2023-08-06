import { getAmazon } from './amazon';
import { getDmm } from './dmm';

export const getData = async (url: string) => {
  if (url.indexOf('dmm.com') !== -1 || url.indexOf('dmm.co.jp') !== -1) {
    return await getDmm(url);
  }

  if (url.indexOf('amazon.co.jp') !== -1) {
    return await getAmazon(url);
  }

  return {
    result: false,
    message: 'target not found',
  };
};
