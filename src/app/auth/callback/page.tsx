"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const handleAuthCallback = async () => {
      try {
        // Let Supabase handle the full URL with all PKCE parameters
        const { data, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          console.log('Auth successful, redirecting to dashboard')
          router.push('/')
        } else {
          console.log('No session found, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Auth callback error:', error)
        router.push('/?error=auth_error')
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
    }
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>Processing authentication...</div>
      <div>Please wait while we redirect you.</div>
    </div>
  )
}
