import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { FastApiClient, FastApiError } from '@/lib/fastapi-client'

export interface BackendUser {
  id: number
  email: string
  full_name: string
  is_active: boolean
  user_role: { role: string }
  external_id: string
}

const syncBackendUserWithChatStore = async (backendUser: BackendUser | null) => {
  if (backendUser?.id) {
    const { useChatStore } = await import('@/store/chat/chats.store')
    useChatStore.getState().setUserId(backendUser.id)
  }
}

interface AuthState {
  // Supabase auth state
  user: User | null
  session: Session | null
  loading: boolean
  
  // Backend user state
  backendUser: BackendUser | null
  backendLoading: boolean
  
  // API client
  apiClient: FastApiClient | null
  
  // Actions
  setAuth: (user: User | null, session: Session | null) => void
  setLoading: (loading: boolean) => void
  initializeBackendUser: () => Promise<void>
  clearAuth: () => void
  createApiClient: (getToken: () => Promise<string | null>) => void
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    loading: true,
    backendUser: null,
    backendLoading: false,
    apiClient: null,

    setAuth: (user: User | null, session: Session | null) => {
      const currentState = get()
      
      // Only update if user/session actually changed
      if (currentState.user?.id !== user?.id || currentState.session?.access_token !== session?.access_token) {
        set({ user, session })
        
        // Initialize backend user when auth is set
        if (user && session) {
          get().initializeBackendUser()
        } else {
          set({ backendUser: null })
        }
      }
    },

    setLoading: (loading: boolean) => {
      set({ loading })
    },

    initializeBackendUser: async () => {
      const { apiClient, user } = get()
      
      if (!apiClient || !user) {
        console.log('Cannot initialize backend user: missing API client or user')
        return
      }

      set({ backendLoading: true })
      
      try {
        console.log('Fetching backend user info...')
        const backendUser = await apiClient.getCurrentUser() as BackendUser
        console.log('Backend user fetched:', backendUser)
        set({ backendUser, backendLoading: false })
        
        await syncBackendUserWithChatStore(backendUser)
      } catch (error) {
        console.error('Failed to fetch backend user:', error)
        
        // If user doesn't exist in backend, try to create them
        if (error instanceof FastApiError && error.status === 404) {
          try {
            console.log('Creating new backend user...')
            const newUser = await apiClient.createUser({
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              external_id: user.id,
              user_role_id: 3,
            }) as BackendUser
            console.log('Backend user created:', newUser)
            set({ backendUser: newUser, backendLoading: false })
            
            await syncBackendUserWithChatStore(newUser)
          } catch (createError) {
            console.error('Failed to create backend user:', createError)
            set({ backendLoading: false })
          }
        } else {
          set({ backendLoading: false })
        }
      }
    },

    clearAuth: () => {
      set({
        user: null,
        session: null,
        backendUser: null,
        backendLoading: false,
        apiClient: null,
      })
    },

    createApiClient: (getToken: () => Promise<string | null>) => {
      const currentState = get()
      
      // Only create new API client if one doesn't exist
      if (!currentState.apiClient) {
        // Use the backend API URL directly
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        let apiUrl = process.env.NEXT_PUBLIC_API_URL
        
        if (!apiUrl) {
          apiUrl = isLocalhost ? 'http://localhost:8000' : ''
        }
        
        // Ensure HTTPS in production
        if (!isLocalhost) {
          apiUrl = apiUrl.replace(/^http:\/\//, 'https://')
        }
        
        const apiClient = new FastApiClient(apiUrl, getToken)
        set({ apiClient })
      }
    },
  }))
)
