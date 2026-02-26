"use client"
import { useState } from 'react'
import { Button, Card, Typography, Space, Alert } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useAuth } from '@/providers/Auth.provider'
import { LogoIcon } from '@/components/icons'
import styles from './LoginCard.module.scss'

const { Title, Text } = Typography

export const LoginCard = () => {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <Space direction="vertical" size="large" className={styles.content}>
          <div className={styles.logo}>
            <LogoIcon />
          </div>
          
          <div className={styles.header}>
            <Title level={2}>Welcome to Hayo</Title>
            <Text type="secondary">
              Your AI-powered travel assistant. Sign in to start planning your next adventure.
            </Text>
          </div>

          {error && (
            <Alert
              message="Sign In Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            loading={loading}
            onClick={handleGoogleSignIn}
            className={styles.signInButton}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <div className={styles.features}>
            <Text type="secondary">With Hayo, you can:</Text>
            <ul>
              <li>Chat with AI to plan your trips</li>
              <li>Book flights and hotels seamlessly</li>
              <li>Manage your travel itineraries</li>
              <li>Secure payment processing</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  )
}
