import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client if environment variables are not available
const isMockClient = !supabaseUrl || !supabaseAnonKey;

if (isMockClient) {
  console.warn('Supabase environment variables are missing. Using mock client.');
}

export const supabase = isMockClient 
  ? createClient('https://mock.supabase.co', 'mock-key', {
      auth: {
        persistSession: false,
      }
    })
  : createClient(supabaseUrl, supabaseAnonKey);

// Types based on our database schema
export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  reputation: number;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  tags: string[];
  votes: number;
  view_count: number;
  answer_count: number;
  is_answered: boolean;
  accepted_answer_id: string | null;
  created_at: string;
  updated_at: string;
  // Join fields
  author?: Profile;
};

export type Answer = {
  id: string;
  question_id: string;
  content: string;
  author_id: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  // Join fields
  author?: Profile;
};

export type Vote = {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'question' | 'answer' | 'comment';
  vote_type: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  content: string;
  author_id: string;
  parent_id: string;
  parent_type: 'question' | 'answer';
  votes: number;
  created_at: string;
  updated_at: string;
  // Join fields
  author?: Profile;
};

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  return { data, error };
};

// Question helpers
export const getQuestions = async (
  page = 1, 
  limit = 10, 
  sort = 'created_at', 
  order: 'asc' | 'desc' = 'desc',
  filter?: { tag?: string, author_id?: string, is_answered?: boolean }
) => {
  let query = supabase
    .from('questions')
    .select(`
      *,
      author:profiles(*)
    `)
    .order(sort, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1);
  
  if (filter?.tag) {
    query = query.contains('tags', [filter.tag]);
  }
  
  if (filter?.author_id) {
    query = query.eq('author_id', filter.author_id);
  }
  
  if (filter?.is_answered !== undefined) {
    query = query.eq('is_answered', filter.is_answered);
  }
  
  const { data, error, count } = await query.returns<Question[]>();
  
  return { data, error, count };
};

export const getQuestionById = async (id: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('id', id)
    .single();
  
  // Increment view count
  if (data) {
    await supabase.rpc('increment_view_count', { question_id: id });
  }
  
  return { data, error };
};

export const createQuestion = async (question: Omit<Question, 'id' | 'votes' | 'view_count' | 'answer_count' | 'is_answered' | 'accepted_answer_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select();
  
  return { data, error };
};

export const updateQuestion = async (id: string, updates: Partial<Question>) => {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
};

// Answer helpers
export const getAnswersByQuestionId = async (questionId: string) => {
  const { data, error } = await supabase
    .from('answers')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('votes', { ascending: false });
  
  return { data, error };
};

export const createAnswer = async (answer: Omit<Answer, 'id' | 'votes' | 'is_accepted' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('answers')
    .insert(answer)
    .select();
  
  return { data, error };
};

export const acceptAnswer = async (id: string) => {
  const { data, error } = await supabase
    .from('answers')
    .update({ is_accepted: true })
    .eq('id', id)
    .select();
  
  return { data, error };
};

// Vote helpers
export const voteOnContent = async (contentId: string, contentType: 'question' | 'answer' | 'comment', voteType: 1 | -1) => {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: new Error('User not authenticated') };
  }
  
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single();
  
  if (existingVote) {
    // Update existing vote
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking the same button
      const { data, error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id);
      
      return { data, error };
    } else {
      // Change vote direction
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
      
      return { data, error };
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        vote_type: voteType
      });
    
    return { data, error };
  }
};

// Notification helpers
export const getNotifications = async (limit = 10) => {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: new Error('User not authenticated') };
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const markNotificationAsRead = async (id: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  
  return { data, error };
};

export const markAllNotificationsAsRead = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: new Error('User not authenticated') };
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);
  
  return { data, error };
};

// Comment helpers
export const getCommentsByParent = async (parentId: string, parentType: 'question' | 'answer') => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('parent_id', parentId)
    .eq('parent_type', parentType)
    .order('created_at', { ascending: true });
  
  return { data, error };
};

export const createComment = async (comment: Omit<Comment, 'id' | 'votes' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select();
  
  return { data, error };
};

// Tag helpers
export const getPopularTags = async (limit = 10) => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit);
  
  return { data, error };
}; 