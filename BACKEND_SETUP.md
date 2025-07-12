# FlowQ Backend Setup

This document outlines the backend setup for the FlowQ platform using Supabase.

## Overview

FlowQ uses Supabase as its backend service, which provides:
- PostgreSQL database
- Authentication
- Storage
- Realtime subscriptions
- Row Level Security (RLS) policies

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon key (public API key)

### 2. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Schema

Run the following SQL in the Supabase SQL Editor to set up your database schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  bio TEXT,
  location VARCHAR(100),
  avatar_url TEXT,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  tags TEXT[] NOT NULL,
  votes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  accepted_answer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  votes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content_id UUID NOT NULL,
  content_type VARCHAR(20) NOT NULL, -- 'question' or 'answer'
  vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type VARCHAR(20), -- 'question', 'answer', 'comment', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  parent_id UUID NOT NULL,
  parent_type VARCHAR(20) NOT NULL, -- 'question' or 'answer'
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements/badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  badge_type VARCHAR(20) NOT NULL, -- 'bronze', 'silver', 'gold'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User saved/bookmarked content
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content_id UUID NOT NULL,
  content_type VARCHAR(20) NOT NULL, -- 'question' or 'answer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);
```

### 4. Row Level Security Policies

Run the following SQL to set up Row Level Security policies:

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own questions" ON questions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own questions" ON questions
  FOR DELETE USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own answers" ON answers
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own answers" ON answers
  FOR DELETE USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create votes" ON votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);
```

### 5. Database Functions and Triggers

Run the following SQL to create database functions and triggers:

```sql
-- Function to create a user profile after signup
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1),
    'https://api.dicebear.com/7.x/initials/svg?seed=' || SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after user signup
CREATE OR REPLACE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_type = 'question' THEN
    UPDATE questions
    SET votes = votes + NEW.vote_type
    WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'answer' THEN
    UPDATE answers
    SET votes = votes + NEW.vote_type
    WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'comment' THEN
    UPDATE comments
    SET votes = votes + NEW.vote_type
    WHERE id = NEW.content_id;
  END IF;
  
  -- Update user reputation
  IF NEW.content_type = 'question' THEN
    UPDATE profiles
    SET reputation = reputation + (NEW.vote_type * 5)
    WHERE id = (SELECT author_id FROM questions WHERE id = NEW.content_id);
  ELSIF NEW.content_type = 'answer' THEN
    UPDATE profiles
    SET reputation = reputation + (NEW.vote_type * 10)
    WHERE id = (SELECT author_id FROM answers WHERE id = NEW.content_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for vote counts
CREATE OR REPLACE TRIGGER update_vote_count_after_vote
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW EXECUTE FUNCTION public.update_vote_count();

-- Function to update answer counts for questions
CREATE OR REPLACE FUNCTION public.update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions
  SET answer_count = answer_count + 1
  WHERE id = NEW.question_id;
  
  -- Create notification for question author
  INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
  SELECT 
    q.author_id,
    'new_answer',
    'New answer to your question',
    'Someone has answered your question: ' || SUBSTRING(q.title, 1, 50) || '...',
    q.id,
    'question'
  FROM questions q
  WHERE q.id = NEW.question_id AND q.author_id != NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for answer counts
CREATE OR REPLACE TRIGGER update_answer_count_after_answer
AFTER INSERT ON answers
FOR EACH ROW EXECUTE FUNCTION public.update_answer_count();

-- Function to handle accepting an answer
CREATE OR REPLACE FUNCTION public.handle_accepted_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the answer is being accepted
  IF NEW.is_accepted = true AND OLD.is_accepted = false THEN
    -- Update the question to mark it as answered and store the accepted answer ID
    UPDATE questions
    SET 
      is_answered = true,
      accepted_answer_id = NEW.id
    WHERE id = NEW.question_id;
    
    -- Award reputation points to the answer author
    UPDATE profiles
    SET reputation = reputation + 15
    WHERE id = NEW.author_id;
    
    -- Create notification for answer author
    INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
    VALUES (
      NEW.author_id,
      'answer_accepted',
      'Your answer was accepted',
      'Your answer has been marked as the accepted solution!',
      NEW.id,
      'answer'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for accepted answers
CREATE OR REPLACE TRIGGER handle_accepted_answer_after_update
AFTER UPDATE ON answers
FOR EACH ROW EXECUTE FUNCTION public.handle_accepted_answer();

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION public.update_tag_usage()
RETURNS TRIGGER AS $$
DECLARE
  tag_name TEXT;
BEGIN
  -- For each tag in the question
  FOREACH tag_name IN ARRAY NEW.tags
  LOOP
    -- Insert the tag if it doesn't exist, or update usage count if it does
    INSERT INTO tags (name, usage_count)
    VALUES (tag_name, 1)
    ON CONFLICT (name)
    DO UPDATE SET usage_count = tags.usage_count + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for tag usage
CREATE OR REPLACE TRIGGER update_tag_usage_after_question
AFTER INSERT ON questions
FOR EACH ROW EXECUTE FUNCTION public.update_tag_usage();

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions
  SET view_count = view_count + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6. Authentication Setup

1. Go to the Authentication section in your Supabase dashboard
2. Under "Providers", enable Email provider
3. Configure email templates if desired
4. Set up password policies

### 7. Frontend Integration

1. Install the Supabase client library:
```bash
npm install @supabase/supabase-js
```

2. Create a Supabase client in your application:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## API Reference

The backend API is accessible through the Supabase client. Key functions are provided in the `src/lib/supabase.ts` file, including:

- Authentication: `signUp`, `signIn`, `signOut`
- User profiles: `getProfile`, `updateProfile`
- Questions: `getQuestions`, `getQuestionById`, `createQuestion`, `updateQuestion`
- Answers: `getAnswersByQuestionId`, `createAnswer`, `acceptAnswer`
- Votes: `voteOnContent`
- Notifications: `getNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`
- Comments: `getCommentsByParent`, `createComment`
- Tags: `getPopularTags`

## Security Considerations

1. All data access is controlled through Row Level Security policies
2. Database functions use `SECURITY DEFINER` to run with elevated privileges when needed
3. Authentication is handled by Supabase Auth
4. Client-side code should validate inputs before sending to the backend
5. Server-side validation is implemented through database constraints and triggers

## Deployment

1. Ensure all environment variables are properly set in your hosting platform
2. Deploy your Next.js application
3. Monitor the Supabase dashboard for any errors or issues 