# DevFlow - Backend Architecture & Implementation Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Supabase Setup & Configuration](#supabase-setup--configuration)
3. [Database Schema Design](#database-schema-design)
4. [Authentication Implementation](#authentication-implementation)
5. [API Design & Endpoints](#api-design--endpoints)
6. [Real-time Features](#real-time-features)
7. [Security Implementation](#security-implementation)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

## Architecture Overview

### Technology Stack
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL (Supabase managed)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **API**: Supabase REST API + Custom PostgreSQL Functions
- **Edge Functions**: Supabase Edge Functions (TypeScript)

### Architecture Principles
1. **Serverless-First**: Leverage Supabase's managed services
2. **Database-Centric**: PostgreSQL as the source of truth
3. **Real-time by Default**: Live updates for better UX
4. **Security-First**: Row Level Security (RLS) everywhere
5. **Performance-Optimized**: Efficient queries and caching

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   API Gateway   │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Supabase Auth  │    │  Supabase       │    │  Row Level      │
│  (JWT Tokens)   │    │  Realtime       │    │  Security       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Supabase Storage│    │  Edge Functions │    │   Webhooks      │
│  (File Upload)  │    │  (Custom Logic) │    │  (Notifications)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Supabase Setup & Configuration

### 1. Project Initialization
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Start local development
supabase start
```

### 2. Environment Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      questions: {
        Row: Question
        Insert: QuestionInsert
        Update: QuestionUpdate
      }
      answers: {
        Row: Answer
        Insert: AnswerInsert
        Update: AnswerUpdate
      }
      votes: {
        Row: Vote
        Insert: VoteInsert
        Update: VoteUpdate
      }
      tags: {
        Row: Tag
        Insert: TagInsert
        Update: TagUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
    }
  }
}
```

### 3. Database Types Generation
```bash
# Generate TypeScript types from database schema
supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > types/supabase.ts
```

## Database Schema Design

### Core Tables Structure

#### 1. Profiles Table (User Extension)
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  location VARCHAR(100),
  avatar_url TEXT,
  reputation INTEGER DEFAULT 0,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_reputation_idx ON profiles(reputation DESC);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

#### 2. Questions Table
```sql
-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tags TEXT[] NOT NULL,
  votes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  accepted_answer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT questions_tags_check CHECK (array_length(tags, 1) >= 1 AND array_length(tags, 1) <= 5),
  CONSTRAINT questions_title_check CHECK (char_length(title) >= 15 AND char_length(title) <= 200)
);

-- Create indexes
CREATE INDEX questions_author_idx ON questions(author_id);
CREATE INDEX questions_tags_idx ON questions USING GIN(tags);
CREATE INDEX questions_created_idx ON questions(created_at DESC);
CREATE INDEX questions_votes_idx ON questions(votes DESC);
CREATE INDEX questions_answered_idx ON questions(is_answered);

-- Full-text search index
CREATE INDEX questions_search_idx ON questions USING GIN(
  to_tsvector('english', title || ' ' || content)
);

-- Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update their questions" ON questions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their questions" ON questions FOR DELETE USING (auth.uid() = author_id);
```

#### 3. Answers Table
```sql
-- Create answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT answers_content_check CHECK (char_length(content) >= 10)
);

-- Create indexes
CREATE INDEX answers_question_idx ON answers(question_id);
CREATE INDEX answers_author_idx ON answers(author_id);
CREATE INDEX answers_votes_idx ON answers(votes DESC);
CREATE INDEX answers_created_idx ON answers(created_at DESC);
CREATE INDEX answers_accepted_idx ON answers(is_accepted);

-- Row Level Security
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON answers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update their answers" ON answers FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their answers" ON answers FOR DELETE USING (auth.uid() = author_id);
```

#### 4. Votes Table
```sql
-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'answer')),
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, content_id, content_type)
);

-- Create indexes
CREATE INDEX votes_user_idx ON votes(user_id);
CREATE INDEX votes_content_idx ON votes(content_id, content_type);
CREATE INDEX votes_created_idx ON votes(created_at DESC);

-- Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their votes" ON votes FOR DELETE USING (auth.uid() = user_id);
```

#### 5. Tags Table
```sql
-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT tags_name_check CHECK (char_length(name) >= 2 AND char_length(name) <= 50)
);

-- Create indexes
CREATE INDEX tags_name_idx ON tags(name);
CREATE INDEX tags_usage_idx ON tags(usage_count DESC);

-- Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### 6. Notifications Table
```sql
-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT notifications_type_check CHECK (type IN ('answer', 'comment', 'mention', 'accept', 'vote', 'system'))
);

-- Create indexes
CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(is_read);
CREATE INDEX notifications_created_idx ON notifications(created_at DESC);
CREATE INDEX notifications_type_idx ON notifications(type);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

### Database Functions

#### 1. Vote Management Function
```sql
-- Function to handle voting with reputation updates
CREATE OR REPLACE FUNCTION handle_vote(
  content_id UUID,
  content_type VARCHAR(20),
  vote_type INTEGER
) RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
  content_author_id UUID;
  existing_vote INTEGER;
  reputation_change INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Prevent self-voting
  IF content_type = 'question' THEN
    SELECT author_id INTO content_author_id FROM questions WHERE id = content_id;
  ELSIF content_type = 'answer' THEN
    SELECT author_id INTO content_author_id FROM answers WHERE id = content_id;
  END IF;
  
  IF current_user_id = content_author_id THEN
    RAISE EXCEPTION 'Cannot vote on your own content';
  END IF;
  
  -- Check existing vote
  SELECT vote_type INTO existing_vote FROM votes 
  WHERE user_id = current_user_id AND content_id = content_id AND content_type = content_type;
  
  -- Handle vote logic
  IF existing_vote IS NULL THEN
    -- New vote
    INSERT INTO votes (user_id, content_id, content_type, vote_type) 
    VALUES (current_user_id, content_id, content_type, vote_type);
    
    reputation_change := CASE WHEN vote_type = 1 THEN 10 ELSE -2 END;
  ELSIF existing_vote != vote_type THEN
    -- Change vote
    UPDATE votes SET vote_type = vote_type 
    WHERE user_id = current_user_id AND content_id = content_id AND content_type = content_type;
    
    reputation_change := CASE WHEN vote_type = 1 THEN 12 ELSE -12 END;
  ELSE
    -- Remove vote
    DELETE FROM votes 
    WHERE user_id = current_user_id AND content_id = content_id AND content_type = content_type;
    
    reputation_change := CASE WHEN vote_type = 1 THEN -10 ELSE 2 END;
  END IF;
  
  -- Update reputation
  UPDATE profiles SET reputation = reputation + reputation_change WHERE id = content_author_id;
  
  -- Update vote count
  IF content_type = 'question' THEN
    UPDATE questions SET votes = (
      SELECT COALESCE(SUM(vote_type), 0) FROM votes WHERE content_id = questions.id AND content_type = 'question'
    ) WHERE id = content_id;
  ELSIF content_type = 'answer' THEN
    UPDATE answers SET votes = (
      SELECT COALESCE(SUM(vote_type), 0) FROM votes WHERE content_id = answers.id AND content_type = 'answer'
    ) WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Question Search Function
```sql
-- Full-text search function
CREATE OR REPLACE FUNCTION search_questions(
  search_query TEXT,
  tag_filters TEXT[] DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  content TEXT,
  author_id UUID,
  tags TEXT[],
  votes INTEGER,
  view_count INTEGER,
  answer_count INTEGER,
  is_answered BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.title,
    q.content,
    q.author_id,
    q.tags,
    q.votes,
    q.view_count,
    q.answer_count,
    q.is_answered,
    q.created_at,
    ts_rank(to_tsvector('english', q.title || ' ' || q.content), plainto_tsquery('english', search_query)) AS relevance
  FROM questions q
  WHERE 
    (search_query = '' OR to_tsvector('english', q.title || ' ' || q.content) @@ plainto_tsquery('english', search_query))
    AND (tag_filters IS NULL OR q.tags && tag_filters)