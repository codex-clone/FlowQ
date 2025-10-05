import { databaseClient } from '../database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  ApiKey,
  TestQuestion,
  TestSession,
  User,
  UserResponse
} from '../models';

const db = databaseClient.getConnection();

type SQLParams = (string | number | null)[];

const runAsync = (
  sql: string,
  params: SQLParams = []
): Promise<{ id?: number; changes?: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        logger.error('Database run error', err, sql, params);
        reject(new AppError('Database operation failed', 500, err));
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = <T>(sql: string, params: SQLParams = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        logger.error('Database get error', err, sql, params);
        reject(new AppError('Database query failed', 500, err));
        return;
      }
      resolve(row as T | undefined);
    });
  });
};

const allAsync = <T>(sql: string, params: SQLParams = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        logger.error('Database all error', err, sql, params);
        reject(new AppError('Database query failed', 500, err));
        return;
      }
      resolve(rows as T[]);
    });
  });
};

export const databaseService = {
  async createAnonymousSession(sessionId: string): Promise<{ user_id: number }> {
    const insertResult = await runAsync(
      'INSERT OR IGNORE INTO users (session_id) VALUES (?)',
      [sessionId]
    );

    let userId = insertResult.id;
    if (!userId) {
      const existing = await getAsync<User>(
        'SELECT * FROM users WHERE session_id = ?',
        [sessionId]
      );
      if (!existing) {
        throw new AppError('Failed to create session', 500);
      }
      userId = existing.id;
    }

    return { user_id: userId! };
  },

  getSession(sessionId: string) {
    return getAsync<User>('SELECT * FROM users WHERE session_id = ?', [sessionId]);
  },

  async touchSession(sessionId: string) {
    await runAsync('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE session_id = ?', [
      sessionId
    ]);
  },

  async saveApiKey(userId: number, serviceName: string, apiKey: string) {
    await runAsync(
      `INSERT INTO user_api_keys (user_id, service_name, api_key, is_active)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, service_name) DO UPDATE SET api_key = excluded.api_key, is_active = 1, last_used = NULL`,
      [userId, serviceName, apiKey]
    );
  },

  getApiKeys(userId: number) {
    return allAsync<ApiKey>(
      'SELECT id, service_name, is_active, created_at, last_used, user_id, api_key FROM user_api_keys WHERE user_id = ?',
      [userId]
    );
  },

  async deleteApiKey(keyId: number, userId: number) {
    const result = await runAsync('DELETE FROM user_api_keys WHERE id = ? AND user_id = ?', [
      keyId,
      userId
    ]);
    if (!result.changes) {
      throw new AppError('API key deletion failed', 404);
    }
  },

  async getApiKeyByService(userId: number, serviceName: string) {
    return getAsync<ApiKey>(
      'SELECT * FROM user_api_keys WHERE user_id = ? AND service_name = ? AND is_active = 1',
      [userId, serviceName]
    );
  },

  async createTestSession(userId: number, languageId: number, testTypeId: number) {
    const result = await runAsync(
      `INSERT INTO test_sessions (user_id, language_id, test_type_id, status)
       VALUES (?, ?, ?, 'active')`,
      [userId, languageId, testTypeId]
    );

    return getAsync<TestSession>('SELECT * FROM test_sessions WHERE id = ?', [result.id!]);
  },

  async updateTestSessionScore(testId: number, score: number, status: string) {
    await runAsync(
      `UPDATE test_sessions SET score = ?, status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [score, status, testId]
    );
  },

  async addQuestion(
    sessionId: number,
    questionText: string,
    questionType: string,
    difficultyLevel: number
  ) {
    const result = await runAsync(
      `INSERT INTO test_questions (session_id, question_text, question_type, difficulty_level)
       VALUES (?, ?, ?, ?)`,
      [sessionId, questionText, questionType, difficultyLevel]
    );

    return getAsync<TestQuestion>('SELECT * FROM test_questions WHERE id = ?', [result.id!]);
  },

  async getQuestionsBySession(sessionId: number) {
    return allAsync<TestQuestion>(
      'SELECT * FROM test_questions WHERE session_id = ? ORDER BY id ASC',
      [sessionId]
    );
  },

  async getQuestionById(questionId: number) {
    return getAsync<TestQuestion>('SELECT * FROM test_questions WHERE id = ?', [questionId]);
  },

  async getResponsesBySession(sessionId: number) {
    return allAsync<UserResponse & { question_session_id: number }>(
      `SELECT ur.*, tq.session_id as question_session_id
       FROM user_responses ur
       INNER JOIN test_questions tq ON ur.question_id = tq.id
       WHERE tq.session_id = ?
       ORDER BY ur.id ASC`,
      [sessionId]
    );
  },

  async addUserResponse(
    questionId: number,
    responseText: string | null,
    audioFilePath: string | null,
    responseTime: number | null
  ) {
    const result = await runAsync(
      `INSERT INTO user_responses (question_id, response_text, audio_file_path, response_time)
       VALUES (?, ?, ?, ?)`,
      [questionId, responseText, audioFilePath, responseTime]
    );

    return getAsync<UserResponse>('SELECT * FROM user_responses WHERE id = ?', [result.id!]);
  },

  async updateResponseScore(responseId: number, score: number, feedback: string | null) {
    await runAsync(
      `UPDATE user_responses SET score = ?, feedback = ? WHERE id = ?`,
      [score, feedback, responseId]
    );
  },

  async saveEvaluation(
    responseId: number,
    metrics: Record<string, unknown>,
    confidenceScore: number | null
  ) {
    await runAsync(
      `INSERT INTO ai_evaluations (response_id, evaluation_metrics, confidence_score)
       VALUES (?, ?, ?)`,
      [responseId, JSON.stringify(metrics), confidenceScore]
    );
  },

  async getLanguageByCode(code: string) {
    return getAsync<{ id: number }>('SELECT id FROM languages WHERE code = ? AND is_active = 1', [
      code
    ]);
  },

  async getTestTypeByName(name: string) {
    return getAsync<{ id: number }>(
      'SELECT id FROM test_types WHERE name = ? AND is_active = 1',
      [name]
    );
  }
};
