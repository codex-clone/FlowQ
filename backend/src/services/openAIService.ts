import fs from 'fs';
import { OpenAI } from 'openai';
import { databaseService } from './databaseService';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const SERVICE_NAME = 'openai';

type GenerateContentParams = {
  userId: number;
  language: string;
  testType: string;
  difficulty: number;
};

type EvaluateParams = {
  userId: number;
  response: string;
  question: string;
  testType: string;
};

type TranscribeParams = {
  userId: number;
  audioFilePath: string;
};

const buildClient = async (userId: number) => {
  const apiKeyRecord = await databaseService.getApiKeyByService(userId, SERVICE_NAME);
  if (!apiKeyRecord) {
    throw new AppError('OpenAI API key not configured for this session', 400);
  }

  return new OpenAI({ apiKey: apiKeyRecord.api_key });
};

export const openAIService = {
  async generateContent({ userId, language, testType, difficulty }: GenerateContentParams) {
    const client = await buildClient(userId);

    const prompt = `Generate ${testType} practice questions for a ${language} learner at difficulty level ${difficulty}. Provide a JSON array with question_text, question_type, and difficulty_level.`;

    try {
      const completion = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.7
      });
      const text = completion.output_text || '[]';
      const questions = JSON.parse(text);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      logger.error('OpenAI content generation failed', error);
      throw new AppError('Failed to generate content using OpenAI', 502, error);
    }
  },

  async evaluateResponse({ userId, response, question, testType }: EvaluateParams) {
    const client = await buildClient(userId);
    const prompt = `You are grading a language ${testType} test. Question: ${question}. Learner response: ${response}. Provide JSON with score (0-10), feedback, and metrics.`;

    try {
      const completion = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
        temperature: 0.2
      });
      const text = completion.output_text ||
        JSON.stringify({ score: 0, feedback: 'No evaluation provided', metrics: {} });
      return JSON.parse(text);
    } catch (error) {
      logger.error('OpenAI evaluation failed', error);
      throw new AppError('Failed to evaluate response using OpenAI', 502, error);
    }
  },

  async transcribeAudio({ userId, audioFilePath }: TranscribeParams) {
    const client = await buildClient(userId);

    try {
      const transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1'
      });
      return transcription.text;
    } catch (error) {
      logger.error('OpenAI transcription failed', error);
      throw new AppError('Failed to transcribe audio using OpenAI Whisper', 502, error);
    }
  }
};
