"use client"
import { UserDashboard } from '@/components/UserDashboard'
import { useDocumentTitle } from '@/hooks'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import styles from './profile.module.scss'

export default function ProfilePage() {
  const router = useRouter()
  
  // Set page title
  useDocumentTitle("Profile")

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
      
      <div className={styles.content}>
        <UserDashboard />
      </div>
    </div>
  )
}
