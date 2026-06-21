import type { Request, Response } from 'express';
import * as habitService from '../services/habit.service';
import {
  validateCreateHabit,
  validateUpdateHabit,
  validateLogDate,
  validateCompletedFlag,
  validateYearParam,
  validateMonthParam,
} from '../validators/habit.validator';
import { getParam } from '../utils/request';

export async function listHabits(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const year = validateYearParam(req.query.year);
  const month = validateMonthParam(req.query.month);

  const habits = await habitService.listHabitsWithStats(userId, year, month);
  res.status(200).json({ habits, year, month });
}

export async function getYearlyOverview(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const year = validateYearParam(req.query.year);

  const overview = await habitService.getYearlyOverview(userId, year);
  res.status(200).json(overview);
}

export async function createHabit(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateCreateHabit(req.body);

  const habit = await habitService.createHabit(userId, input);
  res.status(201).json({ habit });
}

export async function updateHabit(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateUpdateHabit(req.body);

  const habit = await habitService.updateHabit(userId, getParam(req, 'id'), input);

  if (!habit) {
    res.status(404).json({ error: 'Habit not found.' });
    return;
  }

  res.status(200).json({ habit });
}

export async function deleteHabit(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await habitService.deleteHabit(userId, getParam(req, 'id'));

  if (!deleted) {
    res.status(404).json({ error: 'Habit not found.' });
    return;
  }

  res.status(204).send();
}

export async function setHabitLog(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const habitId = getParam(req, 'id');
  const body = req.body as Record<string, unknown>;

  const date = validateLogDate(body.date);
  const completed = validateCompletedFlag(body.completed);

  const log = await habitService.setHabitLog(userId, habitId, date, completed);

  if (!log) {
    res.status(404).json({ error: 'Habit not found.' });
    return;
  }

  res.status(200).json({ log });
}
