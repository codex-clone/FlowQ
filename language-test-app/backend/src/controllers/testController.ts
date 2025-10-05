import { Request, Response, NextFunction } from 'express';
import { databaseService } from '../services/databaseService';
import { openAIService } from '../services/openAIService';
import { AppError } from '../utils/errors';

export const startTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session_id, language, test_type, difficulty = 1 } = req.body;
    if (!session_id || !language || !test_type) {
      throw new AppError('Session ID, language, and test type are required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const languageRecord = await databaseService.getLanguageByCode(language);
    const testTypeRecord = await databaseService.getTestTypeByName(test_type);

    if (!languageRecord || !testTypeRecord) {
      throw new AppError('Unsupported language or test type', 400);
    }

    const testSession = await databaseService.createTestSession(
      session.id,
      languageRecord.id,
      testTypeRecord.id
    );

    let questions: any[] = [];

    const appLogger = (req.app.get('logger') as typeof console) || console;

    try {
      questions = await openAIService.generateContent({
        userId: session.id,
        language,
        testType: test_type,
        difficulty
      });
    } catch (error) {
      questions = [
        {
          question_text: `Describe your favourite activity in ${language === 'de' ? 'German' : 'English'}.`,
          question_type: test_type === 'speaking' ? 'audio_prompt' : 'open_ended',
          difficulty_level: difficulty
        }
      ];
      appLogger.warn('Falling back to static questions', error);
    }

    const createdQuestions = [];
    for (const question of questions) {
      const record = await databaseService.addQuestion(
        testSession!.id,
        question.question_text,
        question.question_type || (test_type === 'reading' ? 'multiple_choice' : 'open_ended'),
        question.difficulty_level || difficulty
      );
      createdQuestions.push(record);
    }

    res.status(201).json({ test_id: testSession!.id, questions: createdQuestions });
  } catch (error) {
    next(error);
  }
};

export const submitResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId } = req.params;
    const { session_id, question_id, response, response_time, transcription_required } = req.body;
    if (!session_id || !question_id) {
      throw new AppError('Session ID and question ID are required', 400);
    }

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const testQuestions = await databaseService.getQuestionsBySession(Number(testId));
    const question = testQuestions.find((q) => q.id === Number(question_id));
    if (!question) {
      throw new AppError('Question not found in test session', 404);
    }

    let responseText: string | null = response || null;
    if (question.question_type === 'audio_prompt' && transcription_required && req.file) {
      responseText = await openAIService.transcribeAudio({
        userId: session.id,
        audioFilePath: req.file.path
      });
    }

    const userResponse = await databaseService.addUserResponse(
      Number(question_id),
      responseText,
      req.file ? req.file.path : null,
      response_time ? Number(response_time) : null
    );

    const appLogger = (req.app.get('logger') as typeof console) || console;

    let evaluation;
    if (responseText) {
      try {
        evaluation = await openAIService.evaluateResponse({
          userId: session.id,
          response: responseText,
          question: question.question_text,
          testType: question.question_type
        });
        await databaseService.updateResponseScore(userResponse!.id, evaluation.score, evaluation.feedback);
        await databaseService.saveEvaluation(userResponse!.id, evaluation.metrics || {}, evaluation.confidence_score || null);
      } catch (error) {
        appLogger.warn('Evaluation failed, skipping AI scoring', error);
      }
    }

    res.status(201).json({ response_id: userResponse!.id, evaluation });
  } catch (error) {
    next(error);
  }
};

export const completeTest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { testId } = req.params;
    const { session_id } = req.body;

    const session = await databaseService.getSession(session_id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const questions = await databaseService.getQuestionsBySession(Number(testId));
    if (!questions.length) {
      throw new AppError('No questions found for this test', 400);
    }

    const userResponses = await databaseService.getResponsesBySession(Number(testId));
    const scoredResponses = userResponses.filter((response) => typeof response.score === 'number');
    const aggregatedScore = scoredResponses.length
      ?
        scoredResponses.reduce((sum, response) => sum + Number(response.score), 0) /
          scoredResponses.length
      : 0;

    const normalizedScore = Number(aggregatedScore.toFixed(2));

    await databaseService.updateTestSessionScore(Number(testId), normalizedScore, 'completed');

    res.json({
      score: normalizedScore,
      feedback: 'AI evaluation summary will appear here.',
      questions,
      responses: userResponses
    });
  } catch (error) {
    next(error);
  }
};
