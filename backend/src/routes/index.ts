import { Router } from 'express';
import { userRouter } from './user.routes';
import { taskRouter } from './task.routes';
import { quickTaskRouter } from './quickTask.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/users', userRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/quick-tasks', quickTaskRouter);
