import type { Request, Response } from 'express';
import * as taskService from '../services/task.service';
import { runRecurrenceEngine } from '../services/recurringTask.service';
import {
  validateCreateTask,
  validateUpdateTask,
} from '../validators/task.validator';
import { getParam } from '../utils/request';

export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const range = req.query.range as 'daily' | 'weekly' | 'monthly' | undefined;
  const status = req.query.status as string | undefined;

  // On-demand recurrence generation: whenever the user loads their tasks,
  // catch up any recurring templates that have occurrences due. There's no
  // scheduler/cron in this stack, so this is the trigger point instead.
  await runRecurrenceEngine(userId);

  const tasks = await taskService.listTasks(userId, { range, status });
  res.status(200).json({ tasks });
}

export async function getTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const task = await taskService.getTaskById(userId, getParam(req, 'id'));

  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  res.status(200).json({ task });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateCreateTask(req.body);

  const task = await taskService.createTask(userId, input);
  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateUpdateTask(req.body);

  const task = await taskService.updateTask(userId, getParam(req, 'id'), input);

  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  res.status(200).json({ task });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await taskService.deleteTask(userId, getParam(req, 'id'));

  if (!deleted) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  res.status(204).send();
}
