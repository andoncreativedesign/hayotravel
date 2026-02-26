"use client";

import { useAuthStore } from "@/store/auth/auth.store";
import { useChatStore } from "@/store/chat/chats.store";
import { ADMIN_SESSION_KEYS } from "@/utils/admin";
import { getFromSessionStorage, setToSessionStorage, removeFromSessionStorage } from "@/utils/session-storage";
import { UserOutlined, CrownOutlined } from "@ant-design/icons";
import { Select, Typography, Space, Avatar, Badge, Divider } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import styles from "./Sidebar.module.scss";

const { Text } = Typography;
const { Option } = Select;

interface BackendUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface AdminUserSelectorProps {
  onUserSelect: (userId: number, userInfo: BackendUser) => void;
}

export const AdminUserSelector = ({ onUserSelect }: AdminUserSelectorProps) => {
  const { apiClient } = useAuthStore();
  const { userId: currentUserId } = useChatStore();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const hasInitialized = useRef(false);

  // Load selected user from session storage on mount
  useEffect(() => {
    const savedUserId = getFromSessionStorage(ADMIN_SESSION_KEYS.SELECTED_USER_ID);
    if (savedUserId) {
      const parsedUserId = parseInt(savedUserId, 10);
      if (!isNaN(parsedUserId)) {
        setSelectedUserId(parsedUserId);
      }
    } else {
      // Default to current user if no saved selection
      setSelectedUserId(currentUserId);
    }
  }, [currentUserId]);

  const {
    data: users,
    isLoading,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.getUsers() as Promise<BackendUser[]>;
    },
    enabled: !!apiClient,
  });

  const handleUserSelect = useCallback((userId: number) => {
    const selectedUser = users?.find(user => user.id === userId);
    if (!selectedUser) return;

    setSelectedUserId(userId);
    
    // Save to session storage
    if (userId === currentUserId) {
      // If selecting current user, remove from session storage (default behavior)
      removeFromSessionStorage(ADMIN_SESSION_KEYS.SELECTED_USER_ID);
    } else {
      setToSessionStorage(ADMIN_SESSION_KEYS.SELECTED_USER_ID, userId.toString());
    }
    
    onUserSelect(userId, selectedUser);
  }, [users, currentUserId, onUserSelect]);

  // Initialize with saved user ID only once
  useEffect(() => {
    if (selectedUserId && users && !hasInitialized.current) {
      const selectedUser = users.find(user => user.id === selectedUserId);
      if (selectedUser) {
        hasInitialized.current = true;
        onUserSelect(selectedUserId, selectedUser);
      }
    }
  }, [selectedUserId, users, onUserSelect]);

  if (!users || isLoading) {
    return (
      <div className={styles["admin-user-selector"]}>
        <div className={styles["admin-user-selector__header"]}>
          <CrownOutlined className={styles["admin-user-selector__crown"]} />
          <Text className={styles["admin-user-selector__title"]}>
            Loading users...
          </Text>
        </div>
      </div>
    );
  }

  const selectedUser = users.find(user => user.id === selectedUserId);
  const isViewingOtherUser = selectedUser && selectedUserId !== currentUserId;

  return (
    <div className={styles["admin-user-selector"]}>
      <div className={styles["admin-user-selector__header"]}>
        <CrownOutlined className={styles["admin-user-selector__crown"]} />
        <Text className={styles["admin-user-selector__title"]}>
          Admin Panel
        </Text>
      </div>
      
      <Select
        className={styles["admin-user-selector__select"]}
        value={selectedUserId}
        onChange={handleUserSelect}
        placeholder="Select a user to view"
        style={{ width: '100%' }}
        size="small"
        showSearch
        filterOption={(input, option) => {
          const user = users.find(u => u.id === option?.value);
          if (!user) return false;
          const searchText = `${user.full_name || ''} ${user.email}`.toLowerCase();
          return searchText.includes(input.toLowerCase());
        }}
      >
        {users.map((user) => (
          <Option key={user.id} value={user.id}>
            <Space align="center" size="small">
              <Avatar 
                size={20} 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: user.id === currentUserId ? '#ff5601' : '#f0f0f0',
                  color: user.id === currentUserId ? '#fff' : '#999'
                }}
              />
              <div className={styles["admin-user-selector__user-info"]}>
                <div className={styles["admin-user-selector__user-name"]}>
                  {user.full_name || user.email.split('@')[0]}
                  {user.id === currentUserId && (
                    <Badge 
                      count="You" 
                      size="small"
                      style={{ 
                        backgroundColor: '#ff5601', 
                        fontSize: '10px',
                        height: '16px',
                        lineHeight: '16px',
                        marginLeft: '4px'
                      }} 
                    />
                  )}
                </div>
                <Text type="secondary" className={styles["admin-user-selector__user-email"]}>
                  {user.email}
                </Text>
              </div>
            </Space>
          </Option>
        ))}
      </Select>
      
      {isViewingOtherUser && (
        <>
          <Divider className={styles["admin-user-selector__divider"]} />
          <div className={styles["admin-user-selector__indicator"]}>
            <Avatar 
              size={16} 
              icon={<UserOutlined />}
              style={{ backgroundColor: '#fa8c16' }}
            />
            <Text className={styles["admin-user-selector__indicator-text"]}>
              Viewing {selectedUser.full_name || selectedUser.email.split('@')[0]}&apos;s chats
            </Text>
          </div>
        </>
      )}
    </div>
  );
};
