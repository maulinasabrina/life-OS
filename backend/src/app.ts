import express, { type Express } from 'express';
import cors from 'cors';
import { env } from './configs/env';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

export function createApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json());

  app.use('/api', apiRouter);

  // Must be registered last so it catches errors from all routes above.
  app.use(errorHandler);

  return app;
}
