import { runChecker } from './checker';

export const entryPoint = async (req: any, res: any) => {
  try {
    if (!req.query.site) throw new Error('paramter [site] required');

    const result = await runChecker(req.query.site);
    if (!result.result) throw new Error(result.message);

    res.status(200).send(result);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
};
