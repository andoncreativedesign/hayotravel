import { createClient } from '@supabase/supabase-js'

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use PKCE flow for better security
    flowType: 'pkce'
  }
})

// Function to create a client with dynamic site URL
export const createSupabaseClientWithSiteUrl = (siteUrl: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Use PKCE flow for better security (tokens won't appear in URL)
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Site-URL': siteUrl,
        'X-Forwarded-Host': new URL(siteUrl).host
      }
    }
  })
}

export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
}

// Helper to validate Supabase connection (for testing/health checks)
export const validateSupabaseConnection = async (): Promise<{
  isValid: boolean
  error?: string
  details?: {
    url: string
    authEnabled: boolean
  }
}> => {
  try {
    // Try to get the session (doesn't require authentication)
    const { error } = await supabase.auth.getSession()
    
    if (error) {
      return {
        isValid: false,
        error: `Auth check failed: ${error.message}`
      }
    }

    return {
      isValid: true,
      details: {
        url: supabaseUrl,
        authEnabled: true
      }
    }
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}
