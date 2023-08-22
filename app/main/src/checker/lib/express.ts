import express from 'express';
import { entryPoint } from './function';
import { log } from 'console';

const app = express();
app.get('/', async (req, res) => await entryPoint(req, res));

const port = process.env.PORT || 8080;
app.listen(port, () => log(`express: listening on port ${port}`));
