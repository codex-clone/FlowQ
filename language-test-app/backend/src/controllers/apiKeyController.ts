import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';
import { AppError } from '../utils/errors';

export const saveApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, service_name, api_key } = req.body;
    if (!session_id || !service_name || !api_key) {
      throw new AppError('Session ID, service name, and API key are required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await databaseService.saveApiKey(session.id, service_name, api_key);

    res.json({ success: true, message: 'API key saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const session = await databaseService.getSession(sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const apiKeys = await databaseService.getApiKeys(session.id);
    const response = apiKeys.map((key) => ({
      id: key.id,
      service_name: key.service_name,
      is_active: Boolean(key.is_active),
      created_at: key.created_at,
      last_used: key.last_used
    }));

    res.json({ api_keys: response });
  } catch (error) {
    next(error);
  }
};

export const deleteApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyId } = req.params;
    const { session_id } = req.body;

    if (!session_id) {
      throw new AppError('Session ID is required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await databaseService.deleteApiKey(Number(keyId), session.id);
    res.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    next(error);
  }
};
