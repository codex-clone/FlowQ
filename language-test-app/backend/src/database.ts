import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { logger } from './utils/logger';

sqlite3.verbose();

const DB_PATH = path.join(process.cwd(), 'language-test.db');

const schemaStatements: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
  );`,
  `CREATE TABLE IF NOT EXISTS test_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
  );`,
  `CREATE TABLE IF NOT EXISTS test_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    language_id INTEGER,
    test_type_id INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score DECIMAL(5,2),
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (language_id) REFERENCES languages(id),
    FOREIGN KEY (test_type_id) REFERENCES test_types(id)
  );`,
  `CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id)
  );`,
  `CREATE TABLE IF NOT EXISTS user_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    response_text TEXT,
    audio_file_path TEXT,
    score DECIMAL(5,2),
    feedback TEXT,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES test_questions(id)
  );`,
  `CREATE TABLE IF NOT EXISTS ai_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER,
    evaluation_metrics TEXT,
    confidence_score DECIMAL(5,2),
    evaluation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES user_responses(id)
  );`,
  `CREATE TABLE IF NOT EXISTS user_api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service_name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, service_name)
  );`
];

class DatabaseClient {
  private db: Database | null = null;

  connect(): Database {
    if (this.db) {
      return this.db;
    }

    const dbExists = fs.existsSync(DB_PATH);

    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Failed to connect to SQLite database', err);
        throw err;
      }
      logger.info(`Connected to SQLite database at ${DB_PATH}`);
    });

    this.db.serialize(() => {
      schemaStatements.forEach((statement) => {
        this.db?.run(statement, (err) => {
          if (err) {
            logger.error('Error executing schema statement', err, statement);
          }
        });
      });

      if (!dbExists) {
        this.seedReferenceData();
      }
    });

    this.db.on('error', (err) => {
      logger.error('Database error', err);
    });

    return this.db;
  }

  private seedReferenceData() {
    if (!this.db) return;

    const languages = [
      { code: 'de', name: 'German' },
      { code: 'en', name: 'English' }
    ];
    const testTypes = [
      { name: 'reading', description: 'Reading comprehension exercises' },
      { name: 'writing', description: 'Writing prompts and evaluation' },
      { name: 'speaking', description: 'Speaking prompts with audio responses' }
    ];

    const insertLanguage = this.db.prepare(
      'INSERT OR IGNORE INTO languages (code, name, is_active) VALUES (?, ?, 1)'
    );
    languages.forEach(({ code, name }) => insertLanguage.run(code, name));
    insertLanguage.finalize();

    const insertTestType = this.db.prepare(
      'INSERT OR IGNORE INTO test_types (name, description, is_active) VALUES (?, ?, 1)'
    );
    testTypes.forEach(({ name, description }) => insertTestType.run(name, description));
    insertTestType.finalize();
  }

  getConnection(): Database {
    return this.connect();
  }
}

export const databaseClient = new DatabaseClient();
