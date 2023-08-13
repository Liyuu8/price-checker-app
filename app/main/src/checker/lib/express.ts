import express from 'express';
import { entryPoint } from './function';

const app = express();
app.get('/', async (req, res) => await entryPoint(req, res));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`express: listening on port ${port}`));
