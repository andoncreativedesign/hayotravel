"use client";

import { useChatLoader } from "@/hooks";
import { useAuth } from "@/providers/Auth.provider";
import { useAuthStore } from "@/store/auth/auth.store";
import { useChatStore } from "@/store/chat/chats.store";
import { isAdminUser } from "@/utils/admin";
import { cn } from "@/utils/helpers/cn";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Tooltip,
  Typography,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightBigIcon,
  CookieIcon,
  FeedbackMessageIcon,
  HelpIcon,
  IdentificationBadgeIcon,
  PlusIcon,
  SignOutIcon,
  UserIcon,
  WalletIcon,
} from "../icons";
import { AdminUserSelector } from "./AdminUserSelector";
import ChatList from "./ChatList";
import styles from "./Sidebar.module.scss";

const { Sider } = Layout;
const { Title, Text } = Typography;

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const { user, signOut } = useAuth();
  const { backendUser } = useAuthStore();
  const { setAdminSelectedUser } = useChatStore();

  // Always load chats regardless of sidebar collapsed state
  const { isLoading } = useChatLoader();

  const isAdmin = isAdminUser(user?.email);

  const onCollapseToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const onNewTripClick = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <IdentificationBadgeIcon />,
      label: "Personal Info",
      onClick: () => router.push("/profile"),
    },
    {
      key: "settings",
      icon: <CookieIcon />,
      label: "Cookie Preferences",
      onClick: () => router.push("/settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <SignOutIcon />,
      label: "Sign Out",
      onClick: handleSignOut,
    },
  ];

  const userName =
    backendUser?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail = user?.email;

  const handleAdminUserSelect = useCallback(
    (
      userId: number,
      userInfo: {
        id: number;
        email: string;
        full_name: string;
        is_active: boolean;
      }
    ) => {
      setAdminSelectedUser(userId, userInfo);
    },
    [setAdminSelectedUser]
  );

  // Check if current route is travel wallet
  const isTravelWalletActive = pathname.startsWith("/travel-wallet");
  const isChatsActive = pathname.startsWith("/chat");
  const isNewChatsActive = pathname.endsWith("/");
  return (
    <Sider
      className={styles["sidebar"]}
      trigger={null}
      collapsible
      width={235}
      collapsed={collapsed}
      collapsedWidth={120}>
      <div className={styles["collapse__wrapper"]}>
        <Tooltip title="Expand" placement="right">
          <Button
            shape="circle"
            className={styles["collapse__btn"]}
            onClick={onCollapseToggle}>
            <ArrowLeftIcon
              style={{ transform: `rotate(${collapsed ? 180 : 0}deg)` }}
            />
          </Button>
        </Tooltip>
      </div>
      <Link href="/" className={styles.logo}>
        <div className={styles.logo__wrapper}>
          <Image src="/logo.svg" alt="Logo" width={72} height={38} />
        </div>
      </Link>

      {collapsed ? (
        <div className={styles["chats__wrapper"]}>
          <Tooltip title="New Chat" placement="right">
            <Button
              type="text"
              className={cn(
                styles["chats__wrapper--collapsed"],
                isNewChatsActive && styles["chats__wrapper--collapsed--active"]
              )}
              onClick={onNewTripClick}>
              <PlusIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Travel wallet" placement="right">
            <Button
              type="text"
              className={cn(
                styles["chats__wrapper--collapsed"],
                isTravelWalletActive &&
                  styles["chats__wrapper--collapsed--active"]
              )}
              onClick={() => router.push("/travel-wallet")}>
              <WalletIcon width={20} height={20} />
            </Button>
          </Tooltip>
          <Tooltip title="Contact Us" placement="right">
            <Button type="text" className={styles["chats__wrapper--collapsed"]}>
              <HelpIcon width={20} height={20} />
            </Button>
          </Tooltip>
          <Tooltip title="Chats" placement="right">
            <Button
              type="text"
              className={cn(
                styles["chats__wrapper--collapsed"],
                isChatsActive && styles["chats__wrapper--collapsed--active"]
              )}
              onClick={onCollapseToggle}>
              <FeedbackMessageIcon />
            </Button>
          </Tooltip>
        </div>
      ) : (
        <div className={styles["chats__wrapper"]}>
          {isAdmin && (
            <AdminUserSelector onUserSelect={handleAdminUserSelect} />
          )}

          {!collapsed && (
            <div className={styles.menu__wrapper}>
              <Menu
                className={styles.menu}
                mode="inline"
                selectable={false}
                items={[
                  {
                    icon: collapsed ? null : (
                      <PlusIcon width={20} height={20} />
                    ),
                    key: "newTrip",
                    label: collapsed ? (
                      <PlusIcon width={20} height={20} />
                    ) : (
                      "New Trip"
                    ),
                    title: "Travel wallet",
                    onClick: onNewTripClick,
                    className: isNewChatsActive ? styles.menu__active : "",
                  },
                  {
                    icon: collapsed ? null : (
                      <WalletIcon width={20} height={20} />
                    ),
                    key: "travel",
                    label: collapsed ? (
                      <WalletIcon width={20} height={20} />
                    ) : (
                      "Travel wallet"
                    ),
                    title: "Travel wallet",
                    onClick: () => router.push("/travel-wallet"),
                    className: isTravelWalletActive ? styles.menu__active : "",
                  },
                  {
                    icon: collapsed ? null : (
                      <HelpIcon width={20} height={20} />
                    ),
                    key: "Contact Us",
                    label: collapsed ? (
                      <HelpIcon width={20} height={20} />
                    ) : (
                      "Contact Us"
                    ),
                    title: "Contact Us",
                  },
                ]}
              />
            </div>
          )}

          <div className={styles.chat}>
            <Text type="secondary" className={styles["chat__title"]}>
              CHATS
            </Text>
            <ChatList isLoading={isLoading} />
          </div>
        </div>
      )}

      <div
        className={cn(
          styles.profileSection,
          collapsed && styles.profileSection__collapsed
        )}>
        <div className={styles.profileSection__wrapper}>
          <Avatar
            className={styles.profileAvatar}
            size={40}
            src={user?.user_metadata?.avatar_url}
            icon={<UserIcon />}
          />
          {!collapsed && (
            <div className={styles.profileText}>
              <Text className={styles.welcome}>Welcome 👋</Text>
              <Title level={5} className={styles.username} title={userEmail}>
                {userName}
              </Title>
            </div>
          )}
        </div>
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="topLeft"
          overlayClassName={styles.profileSection__dropdown}>
          {!collapsed && <ArrowRightBigIcon />}
        </Dropdown>
      </div>

      <div className={styles.footer}>
        {!collapsed && (
          <>
            <Text className={styles.footerLink}>Privacy</Text>
            <Text className={styles.footerLink}>Terms</Text>
            <Text type="secondary" className={styles.copyright}>
              ©2025 Travel Holdings Limited t/a HayoTravel.ai
            </Text>
          </>
        )}
      </div>
    </Sider>
  );
}
