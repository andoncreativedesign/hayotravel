import {
  CalendarIcon,
  MapMarkIcon,
  PencilSimpleIcon,
  ShoppingCartIcon,
  TrashIcon,
  UserMiniIcon,
} from "@/components/icons";
import GradientWrapper from "@/components/ui/GradientWrapper/GradientWrapper";
import { useAuthStore } from "@/store/auth/auth.store";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { useItineraryStore } from "@/store/itinerary/itinerary.store";
import { Chat } from "@/utils/types/chat";
import { DownOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Dropdown, Skeleton, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./ChatHeader.module.scss";
import { ChatHeaderSkeleton } from "./ChatHeaderSkeleton";
import { DeleteModal, RenameModal } from "./modals";

const { Title, Text } = Typography;

interface ChatHeaderProps {
  chatId: string | number;
}

export function ChatHeader({ chatId }: ChatHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { setIsFullWidth, setIsRightPanelOpen, setSectionMode } = useSplitStore(
    (state) => state
  );
  const {
    currentChatMessages,
    chatList,
    updateChatList,
    deleteChatFromList,
    renameChatInList,
    setRenamingChatId,
    renamingChatId,
  } = useChatStore((state) => state);
  const { apiClient } = useAuthStore((state) => state);
  const { itinerary } = useItineraryStore((state) => state);
  const currentChat = currentChatSelector(chatList, chatId);
  const isEmptyItinerary = itinerary.length === 0;

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["chat-metadata", chatId, currentChatMessages.length],
    queryFn: () => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.updateChatTravelInfo(
        chatId?.toString() || "0"
      ) as Promise<Chat>;
    },
    enabled: !!chatId && !!apiClient,
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (chatIdToDelete: string) => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      return apiClient.deleteChatSession(chatIdToDelete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      message.success("Chat deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting chat:", error);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      message.error("Failed to delete chat. The chat has been restored.");
    },
  });

  const renameChatMutation = useMutation({
    mutationFn: async ({
      chatIdToRename,
      title,
    }: {
      chatIdToRename: string;
      title: string;
    }) => {
      if (!apiClient) {
        throw new Error("API client not available");
      }
      setRenamingChatId(chatIdToRename);
      return apiClient.updateChatSessionTitle(chatIdToRename, title);
    },
    onSuccess: (_, { chatIdToRename, title }) => {
      renameChatInList(chatIdToRename, title);
      setRenamingChatId(null);
      message.success("Chat renamed successfully");
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      console.error("Error renaming chat:", error);
      setRenamingChatId(null);
      message.error("Failed to rename chat");
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      updateChatList(data);
    }
  }, [isSuccess, data, updateChatList]);

  const handleOpenItinerary = () => {
    setIsRightPanelOpen(true);
    setIsFullWidth(false);
    setSectionMode(SectionMode.Itinerary);
  };

  const findNextChat = (currentChatToDelete: Chat, chatList: Chat[]) => {
    const currentIndex = chatList.findIndex(
      (chat) => chat.id === currentChatToDelete.id
    );
    if (currentIndex === -1) return null;

    // Try next chat first, if it exists
    if (currentIndex < chatList.length - 1) {
      return chatList[currentIndex + 1];
    }

    // If it's the last chat, try previous chat
    if (currentIndex > 0) {
      return chatList[currentIndex - 1];
    }

    // If it's the only chat, return nulls
    return null;
  };

  const handleDeleteChat = () => {
    if (!currentChat) return;
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!currentChat) return;

    const chatIdToDelete = currentChat.id.toString();
    const nextChat = findNextChat(currentChat, chatList);

    // Optimistically remove from UI and navigate immediately
    deleteChatFromList(chatIdToDelete);

    if (nextChat) {
      // Navigate to next chat using the same ID logic as the current routing
      const nextChatId = nextChat.chat_client_id || nextChat.id;
      router.push(`/chat/${nextChatId}`);
    } else {
      // No other chats available, go to main chat page
      router.push("/chat");
    }

    // Delete in background - don't wait for the result
    deleteChatMutation.mutate(chatIdToDelete);
    setDeleteModalVisible(false);
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleRenameChat = () => {
    if (!currentChat) return;
    setRenameModalVisible(true);
  };

  const handleRenameSubmit = (title: string) => {
    if (!currentChat || !title.trim()) {
      message.error("Please enter a valid chat title");
      return;
    }

    const chatIdToRename = currentChat.id.toString();
    renameChatMutation.mutate({ chatIdToRename, title: title.trim() });
    setRenameModalVisible(false);
  };

  const handleRenameCancel = () => {
    setRenameModalVisible(false);
  };

  const startDate = new Date(
    currentChat ? currentChat.travel_start_date : ""
  ).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(
    currentChat ? currentChat.travel_end_date : ""
  ).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });

  if (isLoading) {
    return <ChatHeaderSkeleton />;
  }

  const dropdownItems = [
    {
      key: "rename",
      label: "Rename chat",
      icon: <PencilSimpleIcon style={{ fontSize: 16 }} />,
      onClick: handleRenameChat,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <TrashIcon style={{ fontSize: 16 }} />,
      onClick: handleDeleteChat,
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.header__inner}>
          <div className={styles.left}>
            <Space size={8} className={styles.titleWrapper}>
              <Title level={4} className={styles.title}>
                {renamingChatId ===
                (currentChat?.id?.toString() || currentChat?.chat_client_id) ? (
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 120, height: 24 }}
                  />
                ) : (
                  currentChat?.title || "New Trip"
                )}
              </Title>
              <Dropdown
                menu={{ items: dropdownItems }}
                trigger={["click"]}
                placement="bottomLeft"
                overlayClassName={styles.chatDropdown}>
                <DownOutlined className={styles.downIcon} />
              </Dropdown>
            </Space>
            <div className={styles.meta}>
              <Space size={16}>
                <Space size={4}>
                  <MapMarkIcon />
                  <Text className={styles.metaText}>{currentChat?.destination || "Unknown"}</Text>
                </Space>
                <Space size={4}>
                  <CalendarIcon />
                  <Text className={styles.metaText}>
                    {startDate} – {endDate}
                  </Text>
                </Space>
                <Space size={4}>
                  <UserMiniIcon />
                  <Text className={styles.metaText}>
                    {chatId === "077ea99d-067a-4932-8482-aece20bf58be"
                      ? "2"
                      : currentChat?.travelers_count || "0"}{" "}
                    travellers
                  </Text>
                </Space>
              </Space>
            </div>
          </div>

          <GradientWrapper className={styles.itineraryBtn__wrapper}>
            {!isEmptyItinerary && <span className={styles.dot} />}
            <Button
              type="default"
              className={styles.itineraryBtn}
              onClick={handleOpenItinerary}>
              <ShoppingCartIcon />
            </Button>
          </GradientWrapper>
        </div>
      </header>

      <RenameModal
        open={renameModalVisible}
        onCancel={handleRenameCancel}
        onSubmit={handleRenameSubmit}
        confirmLoading={renameChatMutation.isPending}
        initialTitle={currentChat?.title || "New Trip"}
      />

      <DeleteModal
        open={deleteModalVisible}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteChatMutation.isPending}
      />
    </>
  );
}
