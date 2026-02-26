import { CalendarIcon, MapMarkIcon, UserMiniIcon } from "@/components/icons";
import { DownOutlined } from "@ant-design/icons";
import { Skeleton, Space } from "antd";
import styles from "./ChatHeader.module.scss";

export function ChatHeaderSkeleton() {
  return (
    <header className={styles.header}>
      <div className={styles.header__inner}>
        <div className={styles.left}>
          <Space size={8} className={styles.titleWrapper}>
            <Skeleton.Input
              active
              size="small"
              style={{ width: 120, height: 24 }}
            />
            <DownOutlined
              className={styles.downIcon}
              style={{ opacity: 0.3 }}
            />
          </Space>
          <div className={styles.meta}>
            <Space size={16}>
              <Space size={4}>
                <MapMarkIcon style={{ opacity: 0.3 }} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 80, height: 16 }}
                />
              </Space>
              <Space size={4}>
                <CalendarIcon style={{ opacity: 0.3 }} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 100, height: 16 }}
                />
              </Space>
              <Space size={4}>
                <UserMiniIcon style={{ opacity: 0.3 }} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 70, height: 16 }}
                />
              </Space>
            </Space>
          </div>
        </div>

        <Skeleton.Button
          active
          size="default"
          className={styles.itineraryBtn}
          style={{ width: 90, height: 32 }}
        />
      </div>
    </header>
  );
}
