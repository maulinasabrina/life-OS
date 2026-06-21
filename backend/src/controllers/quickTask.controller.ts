import type { Request, Response } from 'express';
import * as quickTaskService from '../services/quickTask.service';
import { validateCreateQuickTask, ValidationError } from '../validators/task.validator';
import { getParam } from '../utils/request';

export async function listQuickTasks(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const quickTasks = await quickTaskService.listQuickTasks(userId);
  res.status(200).json({ quickTasks });
}

export async function createQuickTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { title } = validateCreateQuickTask(req.body);

  const quickTask = await quickTaskService.createQuickTask(userId, title);
  res.status(201).json({ quickTask });
}

export async function toggleQuickTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { completed } = req.body as { completed?: unknown };

  if (typeof completed !== 'boolean') {
    throw new ValidationError('completed must be a boolean.');
  }

  const quickTask = await quickTaskService.toggleQuickTask(userId, getParam(req, 'id'), completed);

  if (!quickTask) {
    res.status(404).json({ error: 'Quick task not found.' });
    return;
  }

  res.status(200).json({ quickTask });
}

export async function deleteQuickTask(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await quickTaskService.deleteQuickTask(userId, getParam(req, 'id'));

  if (!deleted) {
    res.status(404).json({ error: 'Quick task not found.' });
    return;
  }

  res.status(204).send();
}
