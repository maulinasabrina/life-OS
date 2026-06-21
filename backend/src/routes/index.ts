import { Router } from 'express';
import { userRouter } from './user.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/users', userRouter);
