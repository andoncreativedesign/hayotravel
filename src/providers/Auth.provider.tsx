"use client"
import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, createSupabaseClientWithSiteUrl } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth/auth.store'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { setAuth, createApiClient, clearAuth } = useAuthStore()
  
  // Cache current token to avoid repeated Supabase calls
  const cachedTokenRef = useRef<string | null>(null)
  const tokenExpiryRef = useRef<number | null>(null)

  const getToken = async (): Promise<string | null> => {
    try {
      // Return cached token if valid and not expired
      if (cachedTokenRef.current && tokenExpiryRef.current) {
        const now = Date.now()
        const timeUntilExpiry = tokenExpiryRef.current - now
        
        // If token expires in more than 5 minutes, use cached version
        if (timeUntilExpiry > 5 * 60 * 1000) {
          console.log('🔄 Using cached token (expires in', Math.round(timeUntilExpiry / 1000 / 60), 'minutes)')
          return cachedTokenRef.current
        }
      }
      
      // Token is expired or not cached, get fresh session
      console.log('🔍 Getting fresh session...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        // Update cache
        cachedTokenRef.current = session.access_token
        tokenExpiryRef.current = session.expires_at ? session.expires_at * 1000 : null
        console.log('✅ Got access token:', session.access_token.substring(0, 50) + '...', 'expires:', new Date(session.expires_at! * 1000))
        return session.access_token
      }
      
      console.log('❌ No access token in session')
      return null
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state changed:', event, {
          hasUser: !!session?.user,
          email: session?.user?.email,
          hasAccessToken: !!session?.access_token,
          tokenExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (session?.user && session.access_token) {
          // Cache the token and expiry time
          cachedTokenRef.current = session.access_token
          tokenExpiryRef.current = session.expires_at ? session.expires_at * 1000 : null
          
          // Create API client first with cached token getter
          createApiClient(getToken)
          // Then set auth state which will trigger backend user initialization
          setAuth(session.user, session)
        } else {
          // Clear cached token
          cachedTokenRef.current = null
          tokenExpiryRef.current = null
          clearAuth()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setAuth, createApiClient, clearAuth])

  const signInWithGoogle = async () => {
    console.log('🚀 signInWithGoogle called!')
    
    // Get current URL info
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'undefined'
    const currentHost = typeof window !== 'undefined' ? window.location.host : 'undefined'
    
    console.log('Current location:', {
      origin: currentOrigin,
      host: currentHost,
      href: typeof window !== 'undefined' ? window.location.href : 'undefined'
    })
    
    console.log('Environment variables:', {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    })
    
    try {
      // Use environment variable if set, otherwise current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || currentOrigin
      const redirectTo = `${siteUrl}/auth/callback`
      
      console.log('🎯 Using redirect URL:', redirectTo)
      
      // Double-check: are we on localhost or a real deployment?
      if (currentOrigin.includes('localhost')) {
        console.warn('⚠️ WARNING: Running on localhost!')
      } else {
        console.log('✅ Running on deployed URL:', currentOrigin)
      }
      
      // Create a Supabase client with the correct site URL for this auth request
      const authClient = createSupabaseClientWithSiteUrl(siteUrl)
      
      console.log('📤 Using auth client with site URL:', siteUrl)
      
      const { error } = await authClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
