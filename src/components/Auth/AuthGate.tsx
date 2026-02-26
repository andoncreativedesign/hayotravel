"use client"
import { useAuth } from '@/providers/Auth.provider'
import { LoginCard } from './LoginCard'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface AuthGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export const AuthGate = ({ 
  children, 
  fallback,
  requireAuth = true 
}: AuthGateProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    )
  }

  if (requireAuth && !user) {
    return fallback || <LoginCard />
  }

  return <>{children}</>
}
