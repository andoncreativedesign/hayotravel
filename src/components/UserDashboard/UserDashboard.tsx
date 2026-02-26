"use client"
import { useAuth } from '@/providers/Auth.provider'
import { useAuthStore } from '@/store/auth/auth.store'
import { Avatar, Button, Card, Descriptions, Space, Spin, Typography } from 'antd'
import { UserOutlined, LogoutOutlined, LoadingOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import styles from './UserDashboard.module.scss'

const { Title, Text } = Typography

export const UserDashboard = () => {
  const { user, session, loading, signOut, getToken } = useAuth()
  const { 
    backendUser, 
    backendLoading, 
    apiClient,
    createApiClient, 
    setAuth 
  } = useAuthStore()

  useEffect(() => {
    if (!apiClient && getToken) {
      createApiClient(getToken)
    }
  }, [apiClient, getToken, createApiClient])

  useEffect(() => {
    setAuth(user, session)
  }, [user, session, setAuth])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading || backendLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <Text>Loading user information...</Text>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Card className={styles.userDashboard}>
      <div className={styles.header}>
        <Space align="center">
          <Avatar 
            size={64} 
            src={user.user_metadata?.avatar_url} 
            icon={<UserOutlined />}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {backendUser?.full_name || user.user_metadata?.full_name || user.email}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </Space>
        
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>

      <Descriptions 
        title="Account Information" 
        bordered 
        column={1}
        className={styles.descriptions}
      >
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
        <Descriptions.Item label="Email Confirmed">
          {user.email_confirmed_at ? 'Yes' : 'No'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Sign In">
          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
        </Descriptions.Item>
        
        {backendUser && (
          <>
            <Descriptions.Item label="Backend User ID">{backendUser.id}</Descriptions.Item>
            <Descriptions.Item label="Role">{backendUser.user_role?.role || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Account Status">
              {backendUser.is_active ? 'Active' : 'Inactive'}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      {!backendUser && (
        <div className={styles.backendUserWarning}>
          <Text type="warning">
            Backend user profile not found. Some features may be limited.
          </Text>
        </div>
      )}
    </Card>
  )
}
