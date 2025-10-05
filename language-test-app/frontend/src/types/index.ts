export type LanguageCode = 'de' | 'en';
export type TestType = 'reading' | 'writing' | 'speaking';

export interface TestQuestion {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'open_ended' | 'audio_prompt';
  difficulty_level: number;
}

export interface TestSession {
  id: number;
  language: LanguageCode;
  testType: TestType;
  started_at?: string;
  completed_at?: string | null;
  score?: number | null;
  status?: 'active' | 'completed' | 'abandoned';
}

export interface TestResult {
  score: number;
  feedback: string;
  questions: TestQuestion[];
  responses: Array<{
    id: number;
    question_id: number;
    response_text: string | null;
    audio_file_path: string | null;
    score: number | null;
    feedback: string | null;
  }>;
}

export interface ApiKeyRecord {
  id: number;
  service_name: string;
  is_active: boolean;
  created_at: string;
  last_used: string | null;
}
