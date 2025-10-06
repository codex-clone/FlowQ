import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';
import { openAIService } from '../services/openAIService';
import { AppError } from '../utils/errors';

export const generateContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, language, test_type, difficulty = 1 } = req.body;
    if (!session_id || !language || !test_type) {
      throw new AppError('Session ID, language, and test type are required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const questions = await openAIService.generateContent({
      userId: session.id,
      language,
      testType: test_type,
      difficulty
    });

    res.json({ questions });
  } catch (error) {
    next(error);
  }
};

export const evaluateResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, question_id, response, type } = req.body;
    if (!session_id || !response) {
      throw new AppError('Session ID and response are required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const question = question_id
      ? await databaseService.getQuestionById(Number(question_id))
      : undefined;

    const questionText = question ? question.question_text : 'Custom prompt';

    const evaluation = await openAIService.evaluateResponse({
      userId: session.id,
      response,
      question: questionText,
      testType: type || 'open_ended'
    });

    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};
