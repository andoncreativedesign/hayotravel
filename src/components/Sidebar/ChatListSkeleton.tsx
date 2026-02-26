import { Skeleton } from "antd";

interface ChatListSkeletonProps {
  loading: boolean;
}

const ChatListSkeleton = ({ loading }: ChatListSkeletonProps) => {
  return (
    <>
      {Array.from({ length: 20 }).map((_, index) => (
        <Skeleton.Node
          key={index}
          active={loading}
          style={{ width: 202, height: 34, marginBottom: 10 }}
        />
      ))}
    </>
  );
};

export default ChatListSkeleton;
