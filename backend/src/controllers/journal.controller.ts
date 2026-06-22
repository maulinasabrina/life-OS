import type { Request, Response } from 'express';
import * as journalService from '../services/journal.service';
import {
  validateCreateJournalEntry,
  validateSearchQuery,
  validateUpdateJournalEntry,
} from '../validators/journal.validator';
import { ValidationError } from '../validators/ValidationError';
import { getParam } from '../utils/request';

export async function listJournalEntries(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const search = validateSearchQuery(req.query.search);
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : undefined;

  const entries = await journalService.listJournalEntries(userId, { search, tag });
  res.status(200).json({ entries });
}

export async function getJournalEntry(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const entry = await journalService.getJournalEntry(userId, getParam(req, 'id'));

  if (!entry) {
    res.status(404).json({ error: 'Journal entry not found.' });
    return;
  }

  res.status(200).json({ entry });
}

export async function createJournalEntry(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateCreateJournalEntry(req.body);

  const entry = await journalService.createJournalEntry(userId, input);
  res.status(201).json({ entry });
}

export async function updateJournalEntry(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const input = validateUpdateJournalEntry(req.body);

  const entry = await journalService.updateJournalEntry(userId, getParam(req, 'id'), input);

  if (!entry) {
    res.status(404).json({ error: 'Journal entry not found.' });
    return;
  }

  res.status(200).json({ entry });
}

export async function deleteJournalEntry(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await journalService.deleteJournalEntry(userId, getParam(req, 'id'));

  if (!deleted) {
    res.status(404).json({ error: 'Journal entry not found.' });
    return;
  }

  res.status(204).send();
}

export async function uploadJournalImage(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const entryId = getParam(req, 'id');
  const file = (req as any).file;
  if (!file) {
    throw new ValidationError('No file provided. Send an image as multipart/form-data field "image".');
  }

  let image;
  try {
    image = await journalService.uploadJournalImage(
      userId,
      entryId,
      file.buffer,
      file.originalname,
      file.mimetype
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'ENTRY_NOT_FOUND') {
      res.status(404).json({ error: 'Journal entry not found.' });
      return;
    }
    throw err;
  }

  res.status(201).json({ image });
}

export async function deleteJournalImage(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const deleted = await journalService.deleteJournalImage(
    userId,
    getParam(req, 'id'),
    getParam(req, 'imageId')
  );

  if (!deleted) {
    res.status(404).json({ error: 'Image not found.' });
    return;
  }

  res.status(204).send();
}
