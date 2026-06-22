import type { Request, Response } from 'express';
import * as recurringTaskService from '../services/recurringTask.service';
import {
  validateCreateRecurringTask,
  validateUpdateRecurringTask,
} from '../validators/recurringTask.validator';
import { getParam } from '../utils/request';

export async function listRecurringTasks(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const recurringTasks = await recurringTaskService.listRecurringTasks(userId);
  res.status(200).json({ recurringTasks });
}

export async function createRecurringTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateCreateRecurringTask(req.body);

  const recurringTask = await recurringTaskService.createRecurringTask(userId, input);
  res.status(201).json({ recurringTask });
}

export async function updateRecurringTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateUpdateRecurringTask(req.body);

  const recurringTask = await recurringTaskService.updateRecurringTask(
    userId,
    getParam(req, 'id'),
    input
  );

  if (!recurringTask) {
    res.status(404).json({ error: 'Recurring task not found.' });
    return;
  }

  res.status(200).json({ recurringTask });
}

export async function deleteRecurringTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await recurringTaskService.deleteRecurringTask(userId, getParam(req, 'id'));

  if (!deleted) {
    res.status(404).json({ error: 'Recurring task not found.' });
    return;
  }

  res.status(204).send();
}
