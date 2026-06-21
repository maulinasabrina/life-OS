import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { getCurrentUser } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/me', requireAuth, asyncHandler(getCurrentUser));
