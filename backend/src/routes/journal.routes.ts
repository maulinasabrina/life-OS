import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { imageUpload } from '../middlewares/upload.middleware';
import * as journalController from '../controllers/journal.controller';

export const journalRouter = Router();

journalRouter.use(requireAuth);

journalRouter.get('/', asyncHandler(journalController.listJournalEntries));
journalRouter.post('/', asyncHandler(journalController.createJournalEntry));
journalRouter.get('/:id', asyncHandler(journalController.getJournalEntry));
journalRouter.patch('/:id', asyncHandler(journalController.updateJournalEntry));
journalRouter.delete('/:id', asyncHandler(journalController.deleteJournalEntry));
journalRouter.post(
  '/:id/images',
  imageUpload.single('image'),
  asyncHandler(journalController.uploadJournalImage)
);
journalRouter.delete('/:id/images/:imageId', asyncHandler(journalController.deleteJournalImage));
