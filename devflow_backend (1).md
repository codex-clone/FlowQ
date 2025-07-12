# FlowQ - Backend Architecture & Implementation Guide

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
  ORDER BY 
    CASE 
      WHEN sort_by = 'relevance' THEN ts_rank(to_tsvector('english', q.title || ' ' || q.content), plainto_tsquery('english', search_query))
      ELSE NULL
    END DESC,
    CASE WHEN sort_by = 'votes' THEN q.votes ELSE NULL END DESC,
    CASE WHEN sort_by = 'recent' THEN q.created_at ELSE NULL END DESC,
    CASE WHEN sort_by = 'active' THEN q.updated_at ELSE NULL END DESC
  LIMIT limit_count OFFSET offset_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. Notification Creation Function
```sql
-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  recipient_id UUID,
  notification_type VARCHAR(50),
  notification_title VARCHAR(200),
  notification_message TEXT,
  related_content_id UUID DEFAULT NULL
) RETURNS UUID AS $
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (recipient_id, notification_type, notification_title, notification_message, related_content_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 4. Answer Acceptance Function
```sql
-- Function to accept an answer
CREATE OR REPLACE FUNCTION accept_answer(
  question_id UUID,
  answer_id UUID
) RETURNS VOID AS $
DECLARE
  question_author_id UUID;
  answer_author_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Get question author
  SELECT author_id INTO question_author_id FROM questions WHERE id = question_id;
  
  -- Check if current user is question author
  IF current_user_id != question_author_id THEN
    RAISE EXCEPTION 'Only question author can accept answers';
  END IF;
  
  -- Get answer author
  SELECT author_id INTO answer_author_id FROM answers WHERE id = answer_id;
  
  -- Remove previous accepted answer
  UPDATE answers SET is_accepted = FALSE 
  WHERE question_id = question_id AND is_accepted = TRUE;
  
  -- Accept new answer
  UPDATE answers SET is_accepted = TRUE WHERE id = answer_id;
  
  -- Update question
  UPDATE questions SET 
    is_answered = TRUE,
    accepted_answer_id = answer_id
  WHERE id = question_id;
  
  -- Update reputation (+15 for accepted answer)
  UPDATE profiles SET reputation = reputation + 15 WHERE id = answer_author_id;
  
  -- Create notification
  PERFORM create_notification(
    answer_author_id,
    'accept',
    'Your answer was accepted!',
    'Your answer has been marked as the accepted solution.',
    answer_id
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Authentication Implementation

### 1. Authentication Service
```typescript
// services/auth.ts
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  // Sign in with OAuth providers
  static async signInWithProvider(provider: 'google' | 'github' | 'linkedin_oidc') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
  }

  // Update password
  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}
```

### 2. Profile Management
```typescript
// services/profile.ts
import { supabase } from '@/lib/supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'

export class ProfileService {
  // Create profile after signup
  static async createProfile(userId: string, profileData: Partial<ProfileInsert>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        ...profileData
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Get profile by ID
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Update profile
  static async updateProfile(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Check username availability
  static async checkUsernameAvailability(username: string, currentUserId?: string) {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(1)
    
    if (currentUserId) {
      query = query.neq('id', currentUserId)
    }
    
    const { data } = await query
    return data?.length === 0
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    const [questionsResult, answersResult, votesResult] = await Promise.all([
      supabase
        .from('questions')
        .select('id, votes, view_count')
        .eq('author_id', userId),
      supabase
        .from('answers')
        .select('id, votes, is_accepted')
        .eq('author_id', userId),
      supabase
        .from('votes')
        .select('vote_type')
        .eq('user_id', userId)
    ])

    const questions = questionsResult.data || []
    const answers = answersResult.data || []
    const votes = votesResult.data || []

    return {
      questionsCount: questions.length,
      answersCount: answers.length,
      acceptedAnswers: answers.filter(a => a.is_accepted).length,
      totalViews: questions.reduce((sum, q) => sum + q.view_count, 0),
      totalVotes: votes.length,
      upvotesGiven: votes.filter(v => v.vote_type === 1).length,
      downvotesGiven: votes.filter(v => v.vote_type === -1).length
    }
  }
}
```

## API Design & Endpoints

### 1. Questions API
```typescript
// services/questions.ts
import { supabase } from '@/lib/supabase'
import type { Question, QuestionInsert, QuestionUpdate } from '@/types/database'

export class QuestionsService {
  // Create a new question
  static async createQuestion(questionData: QuestionInsert) {
    const { data, error } = await supabase
      .from('questions')
      .insert([questionData])
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url, reputation),
        answers(id)
      `)
      .single()
    
    if (error) throw error
    
    // Update tag usage counts
    await this.updateTagUsage(questionData.tags)
    
    return data
  }

  // Get question by ID with full details
  static async getQuestion(questionId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url, reputation),
        answers(
          *,
          author:profiles(id, username, display_name, avatar_url, reputation)
        )
      `)
      .eq('id', questionId)
      .single()
    
    if (error) throw error
    
    // Increment view count
    await supabase
      .from('questions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', questionId)
    
    return data
  }

  // Get questions with filters and pagination
  static async getQuestions(options: {
    page?: number
    limit?: number
    sortBy?: 'recent' | 'votes' | 'active' | 'unanswered'
    tags?: string[]
    author?: string
    search?: string
  } = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'recent',
      tags,
      author,
      search
    } = options

    let query = supabase
      .from('questions')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url, reputation)
      `)

    // Apply filters
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }
    
    if (author) {
      query = query.eq('author_id', author)
    }
    
    if (search) {
      // Use the search function for full-text search
      const { data, error } = await supabase
        .rpc('search_questions', {
          search_query: search,
          tag_filters: tags,
          sort_by: sortBy,
          limit_count: limit,
          offset_count: (page - 1) * limit
        })
      
      if (error) throw error
      return data
    }

    // Apply sorting
    switch (sortBy) {
      case 'votes':
        query = query.order('votes', { ascending: false })
        break
      case 'active':
        query = query.order('updated_at', { ascending: false })
        break
      case 'unanswered':
        query = query.eq('is_answered', false).order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error } = await query
    if (error) throw error
    
    return data
  }

  // Update question
  static async updateQuestion(questionId: string, updates: QuestionUpdate) {
    const { data, error } = await supabase
      .from('questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete question
  static async deleteQuestion(questionId: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)
    
    if (error) throw error
  }

  // Vote on question
  static async voteQuestion(questionId: string, voteType: 1 | -1) {
    const { error } = await supabase
      .rpc('handle_vote', {
        content_id: questionId,
        content_type: 'question',
        vote_type: voteType
      })
    
    if (error) throw error
  }

  // Get user's vote on question
  static async getUserVote(questionId: string, userId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('content_id', questionId)
      .eq('content_type', 'question')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.vote_type || null
  }

  // Update tag usage counts
  private static async updateTagUsage(tags: string[]) {
    for (const tag of tags) {
      await supabase
        .from('tags')
        .upsert({
          name: tag,
          usage_count: 1
        }, {
          onConflict: 'name',
          ignoreDuplicates: false
        })
    }
  }
}
```

### 2. Answers API
```typescript
// services/answers.ts
import { supabase } from '@/lib/supabase'
import type { Answer, AnswerInsert, AnswerUpdate } from '@/types/database'

export class AnswersService {
  // Create a new answer
  static async createAnswer(answerData: AnswerInsert) {
    const { data, error } = await supabase
      .from('answers')
      .insert([answerData])
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url, reputation)
      `)
      .single()
    
    if (error) throw error
    
    // Update question answer count
    await supabase
      .rpc('increment_answer_count', { question_id: answerData.question_id })
    
    // Create notification for question author
    const { data: question } = await supabase
      .from('questions')
      .select('author_id, title')
      .eq('id', answerData.question_id)
      .single()
    
    if (question && question.author_id !== answerData.author_id) {
      await supabase
        .rpc('create_notification', {
          recipient_id: question.author_id,
          notification_type: 'answer',
          notification_title: 'New answer to your question',
          notification_message: `Someone answered your question: "${question.title}"`,
          related_content_id: data.id
        })
    }
    
    return data
  }

  // Get answers for a question
  static async getQuestionAnswers(questionId: string) {
    const { data, error } = await supabase
      .from('answers')
      .select(`
        *,
        author:profiles(id, username, display_name, avatar_url, reputation)
      `)
      .eq('question_id', questionId)
      .order('is_accepted', { ascending: false })
      .order('votes', { ascending: false })
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }

  // Update answer
  static async updateAnswer(answerId: string, updates: AnswerUpdate) {
    const { data, error } = await supabase
      .from('answers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', answerId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete answer
  static async deleteAnswer(answerId: string) {
    const { error } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId)
    
    if (error) throw error
  }

  // Accept answer
  static async acceptAnswer(questionId: string, answerId: string) {
    const { error } = await supabase
      .rpc('accept_answer', {
        question_id: questionId,
        answer_id: answerId
      })
    
    if (error) throw error
  }

  // Vote on answer
  static async voteAnswer(answerId: string, voteType: 1 | -1) {
    const { error } = await supabase
      .rpc('handle_vote', {
        content_id: answerId,
        content_type: 'answer',
        vote_type: voteType
      })
    
    if (error) throw error
  }

  // Get user's vote on answer
  static async getUserVote(answerId: string, userId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('content_id', answerId)
      .eq('content_type', 'answer')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data?.vote_type || null
  }
}
```

## Real-time Features

### 1. Real-time Subscriptions
```typescript
// services/realtime.ts
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map()

  // Subscribe to question updates
  subscribeToQuestion(questionId: string, callbacks: {
    onAnswerAdded?: (answer: any) => void
    onAnswerUpdated?: (answer: any) => void
    onAnswerDeleted?: (answer: any) => void
    onVoteChanged?: (data: any) => void
  }) {
    const channelName = `question:${questionId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'answers',
          filter: `question_id=eq.${questionId}`
        }, 
        (payload) => {
          callbacks.onAnswerAdded?.(payload.new)
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'answers',
          filter: `question_id=eq.${questionId}`
        }, 
        (payload) => {
          callbacks.onAnswerUpdated?.(payload.new)
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'answers',
          filter: `question_id=eq.${questionId}`
        }, 
        (payload) => {
          callbacks.onAnswerDeleted?.(payload.old)
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes'
        }, 
        (payload) => {
          callbacks.onVoteChanged?.(payload)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const channelName = `notifications:${userId}`
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      channel.unsubscribe()
    })
    this.channels.clear()
  }
}

// Global instance
export const realtimeService = new RealtimeService()
```

### 2. Notification System
```typescript
// services/notifications.ts
import { supabase } from '@/lib/supabase'
import type { Notification, NotificationInsert } from '@/types/database'

export class NotificationService {
  // Get user notifications
  static async getUserNotifications(userId: string, options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
  } = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error
    
    return data
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    
    if (error) throw error
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
  }

  // Get unread count
  static async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    return count || 0
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    
    if (error) throw error
  }
}
```

## Security Implementation

### 1. Row Level Security Policies
```sql
-- Additional RLS policies for enhanced security

-- Prevent users from voting on their own content
CREATE POLICY "Users cannot vote on their own content" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() != (
      CASE 
        WHEN content_type = 'question' THEN 
          (SELECT author_id FROM questions WHERE id = content_id)
        WHEN content_type = 'answer' THEN 
          (SELECT author_id FROM answers WHERE id = content_id)
      END
    )
  );

-- Limit vote changes per day
CREATE POLICY "Limit daily votes" ON votes
  FOR INSERT WITH CHECK (
    (SELECT COUNT(*) FROM votes WHERE user_id = auth.uid() AND created_at >= CURRENT_DATE) < 40
  );

-- Only question authors can accept answers
CREATE POLICY "Only question authors can accept answers" ON answers
  FOR UPDATE USING (
    CASE 
      WHEN is_accepted = true THEN 
        auth.uid() = (SELECT author_id FROM questions WHERE id = question_id)
      ELSE true
    END
  );
```

### 2. Input Validation & Sanitization
```typescript
// utils/validation.ts
import { z } from 'zod'

export const questionSchema = z.object({
  title: z.string()
    .min(15, 'Title must be at least 15 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_?!.,]+$/, 'Title contains invalid characters'),
  content: z.string()
    .min(30, 'Content must be at least 30 characters')
    .max(30000, 'Content must be less than 30,000 characters'),
  tags: z.array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed')
    .refine((tags) => tags.every(tag => tag.length >= 2 && tag.length <= 50), {
      message: 'Each tag must be between 2 and 50 characters'
    })
})

export const answerSchema = z.object({
  content: z.string()
    .min(10, 'Answer must be at least 10 characters')
    .max(30000, 'Answer must be less than 30,000 characters'),
  question_id: z.string().uuid('Invalid question ID')
})

export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
})
```

### 3. Rate Limiting
```typescript
// utils/rateLimiter.ts
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }
    
    const userRequests = this.requests.get(key)!
    
    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift()
    }
    
    // Check if limit exceeded
    if (userRequests.length >= config.maxRequests) {
      return false
    }
    
    // Add current request
    userRequests.push(now)
    return true
  }
}

export const rateLimiter = new RateLimiter()

// Usage in components
export const useRateLimit = (key: string, config: RateLimitConfig) => {
  return {
    isAllowed: () => rateLimiter.isAllowed(key, config),
    configs: {
      questions: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 questions per minute
      answers: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 answers per minute
      votes: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 votes per minute
    }
  }
}
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Create additional indexes for better performance
CREATE INDEX CONCURRENTLY questions_full_text_idx ON questions USING GIN(to_tsvector('english', title || ' ' || content));
CREATE INDEX CONCURRENTLY answers_full_text_idx ON answers USING GIN(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY profiles_username_lower_idx ON profiles(LOWER(username));

-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY questions_author_created_idx ON questions(author_id, created_at DESC);
CREATE INDEX CONCURRENTLY answers_question_votes_idx ON answers(question_id, votes DESC);
CREATE INDEX CONCURRENTLY votes_content_user_idx ON votes(content_id, content_type, user_id);

-- Optimize frequently used queries with materialized views
CREATE MATERIALIZED VIEW question_stats AS
SELECT 
  q.id,
  q.title,
  q.author_id,
  q.created_at,
  q.votes,
  q.view_count,
  q.answer_count,
  q.is_answered,
  p.username,
  p.display_name,
  p.avatar_url,
  p.reputation
FROM questions q
JOIN profiles p ON q.author_id = p.id
ORDER BY q.created_at DESC;

-- Create index on materialized view
CREATE INDEX question_stats_created_idx ON question_stats(created_at DESC);
CREATE INDEX question_stats_votes_idx ON question_stats(votes DESC);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_question_stats()
RETURNS TRIGGER AS $
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY question_stats;
  RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Triggers to refresh materialized view
CREATE TRIGGER refresh_question_stats