import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import * as recurringTaskController from '../controllers/recurringTask.controller';

export const recurringTaskRouter = Router();

recurringTaskRouter.use(requireAuth);

recurringTaskRouter.get('/', asyncHandler(recurringTaskController.listRecurringTasks));
recurringTaskRouter.post('/', asyncHandler(recurringTaskController.createRecurringTask));
recurringTaskRouter.patch('/:id', asyncHandler(recurringTaskController.updateRecurringTask));
recurringTaskRouter.delete('/:id', asyncHandler(recurringTaskController.deleteRecurringTask));
