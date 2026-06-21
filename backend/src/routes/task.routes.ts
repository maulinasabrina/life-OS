import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import * as taskController from '../controllers/task.controller';

export const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get('/', asyncHandler(taskController.listTasks));
taskRouter.get('/:id', asyncHandler(taskController.getTask));
taskRouter.post('/', asyncHandler(taskController.createTask));
taskRouter.patch('/:id', asyncHandler(taskController.updateTask));
taskRouter.delete('/:id', asyncHandler(taskController.deleteTask));
