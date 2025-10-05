export interface User {
  id: number;
  session_id: string;
  created_at: string;
  last_active: string;
}

export interface Session {
  session_id: string;
  user_id: number;
}

export interface ApiKey {
  id: number;
  user_id: number;
  service_name: string;
  api_key: string;
  is_active: number;
  created_at: string;
  last_used: string | null;
}

export interface TestSession {
  id: number;
  user_id: number;
  language_id: number;
  test_type_id: number;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  status: string;
}

export interface TestQuestion {
  id: number;
  session_id: number;
  question_text: string;
  question_type: string;
  difficulty_level: number;
  created_at: string;
}

export interface UserResponse {
  id: number;
  question_id: number;
  response_text: string | null;
  audio_file_path: string | null;
  score: number | null;
  feedback: string | null;
  response_time: number | null;
  created_at: string;
}

export interface AIEvaluation {
  id: number;
  response_id: number;
  evaluation_metrics: string;
  confidence_score: number | null;
  evaluation_time: string;
}
