import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import * as quickTaskController from '../controllers/quickTask.controller';

export const quickTaskRouter = Router();

quickTaskRouter.use(requireAuth);

quickTaskRouter.get('/', asyncHandler(quickTaskController.listQuickTasks));
quickTaskRouter.post('/', asyncHandler(quickTaskController.createQuickTask));
quickTaskRouter.patch('/:id', asyncHandler(quickTaskController.toggleQuickTask));
quickTaskRouter.delete('/:id', asyncHandler(quickTaskController.deleteQuickTask));
