import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import * as habitController from '../controllers/habit.controller';

export const habitRouter = Router();

habitRouter.use(requireAuth);

habitRouter.get('/', asyncHandler(habitController.listHabits));
habitRouter.get('/yearly-overview', asyncHandler(habitController.getYearlyOverview));
habitRouter.post('/', asyncHandler(habitController.createHabit));
habitRouter.patch('/:id', asyncHandler(habitController.updateHabit));
habitRouter.delete('/:id', asyncHandler(habitController.deleteHabit));
habitRouter.put('/:id/logs', asyncHandler(habitController.setHabitLog));
