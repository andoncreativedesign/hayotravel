"use client";

import { useChatStore } from "@/store/chat/chats.store";
import { useSplitStore } from "@/store/chat/split.store";
import { useItineraryStore } from "@/store/itinerary/itinerary.store";
import { cn } from "@/utils/helpers/cn";
import { Chat } from "@/utils/types/chat";
import { List, Skeleton, Tooltip } from "antd";
import { useParams, useRouter } from "next/navigation";
import ChatListSkeleton from "./ChatListSkeleton";
import styles from "./Sidebar.module.scss";

const ChatList = ({ isLoading }: { isLoading: boolean }) => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const currentChatId = params?.id;
  const { chatList, renamingChatId } = useChatStore();
  const { setIsRightPanelOpen, setIsFullWidth } = useSplitStore(
    (state) => state
  );
  const setItinerary = useItineraryStore((state) => state.setItinerary);

  const onTripClick = (chatItem: Chat) => {
    setIsRightPanelOpen(false);
    setIsFullWidth(false);
    setItinerary([]);
    router.push(`/chat/${chatItem.chat_client_id || chatItem.id}`);
  };

  if (isLoading) return <ChatListSkeleton loading={isLoading} />;

  return (
    <List
      className={styles["chat__list"]}
      itemLayout="horizontal"
      dataSource={chatList}
      renderItem={(item) => {
        const isCurrentChat =
          currentChatId === (item.chat_client_id || item.id);
        const isRenaming =
          renamingChatId === (item.id?.toString() || item.chat_client_id);

        return (
          <Tooltip title={item.title || "New Trip"} placement="right">
            <List.Item
              className={cn(
                styles["chat__item"],
                isCurrentChat && styles["chat__item--active"]
              )}
              onClick={() => onTripClick(item)}
              style={{ cursor: "pointer" }}>
              <span className={styles["chat__item__text"]}>
                {isRenaming ? (
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: 140, height: 16 }}
                  />
                ) : (
                  item.title || "New Trip"
                )}
              </span>
            </List.Item>
          </Tooltip>
        );
      }}
    />
  );
};

export default ChatList;
