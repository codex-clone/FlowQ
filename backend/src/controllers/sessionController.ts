import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from '../services/databaseService';
import { AppError } from '../utils/errors';

export const createSession = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = uuidv4();
    const { user_id } = await databaseService.createAnonymousSession(sessionId);

    res.status(201).json({ session_id: sessionId, user_id });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }

    const session = await databaseService.getSession(sessionId);
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    await databaseService.touchSession(sessionId);

    res.json({
      session_id: session.session_id,
      created_at: session.created_at,
      last_active: session.last_active
    });
  } catch (error) {
    next(error);
  }
};
