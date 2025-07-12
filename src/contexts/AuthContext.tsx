'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getProfile, Profile } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateUserProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for development when Supabase is not configured
const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const mockProfile: Profile = {
  id: 'mock-user-id',
  username: 'user@example.com',
  display_name: 'Demo User',
  bio: 'This is a mock profile for development',
  location: 'Anywhere',
  avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DU',
  reputation: 120,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    const getActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data } = await getProfile(session.user.id)
          setProfile(data ?? null)
        }
      } catch (error) {
        console.warn('Error getting session, using mock data:', error)
        setUseMockData(true)
        // Use mock data for development
        setUser(mockUser)
        setProfile(mockProfile)
      }
      
      setLoading(false)
    }

    getActiveSession()

    try {
      // Listen for changes on auth state
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const { data } = await getProfile(session.user.id)
            setProfile(data ?? null)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.warn('Error setting up auth listener, using mock data:', error)
      setUseMockData(true)
      // Use mock data for development
      setUser(mockUser)
      setProfile(mockProfile)
      setLoading(false)
      
      return () => {}
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (useMockData) {
      // Mock successful sign in
      setUser(mockUser)
      setProfile(mockProfile)
      return { error: null }
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      return { error }
    } catch (error) {
      console.error('Error signing in:', error)
      return { error }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    if (useMockData) {
      // Mock successful sign up
      setUser(mockUser)
      setProfile(mockProfile)
      return { error: null }
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      return { error }
    } catch (error) {
      console.error('Error signing up:', error)
      return { error }
    }
  }

  // Sign out
  const signOut = async () => {
    if (useMockData) {
      // Mock sign out
      setUser(null)
      setProfile(null)
      return
    }
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Update user profile
  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return
    
    if (useMockData) {
      // Mock profile update
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (!error && profile) {
        setProfile({ ...profile, ...updates })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 