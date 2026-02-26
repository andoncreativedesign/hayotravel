import { Skeleton } from "antd";
import styles from "./PreviewMessage.module.scss";

export function MessagesSkeleton() {
  return (
    <div className={styles.wrapper} style={{ marginTop: "24px" }}>
      {/* First user message */}
      <div className={`${styles.messageRow} ${styles.userRow}`}>
        <div className={styles.content}>
          <div className={`${styles.bubble} ${styles.userBubble}`}>
            <div className={styles.userText}>
              <Skeleton.Input
                active
                style={{
                  width: 400,
                  height: 60,
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
        <Skeleton.Avatar active size={32} className={styles.avatar} />
      </div>

      {/* First AI response skeleton */}
      <div className={`${styles.messageRow} ${styles.botRow}`}>
        <Skeleton.Avatar
          active
          size={32}
          className={`${styles.avatar} ${styles.avatar__logo}`}
        />
        <div className={styles.content}>
          <div className={`${styles.bubble} ${styles.botBubble}`}>
            <div className={styles.botText}>
              <Skeleton.Input
                active
                style={{
                  width: 400,
                  height: 160,
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Second user message */}
      <div className={`${styles.messageRow} ${styles.userRow}`}>
        <div className={styles.content}>
          <div className={`${styles.bubble} ${styles.userBubble}`}>
            <div className={styles.userText}>
              <Skeleton.Input
                active
                style={{
                  width: 320,
                  height: 40,
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
        <Skeleton.Avatar active size={32} className={styles.avatar} />
      </div>

      {/* Second AI response skeleton */}
      <div className={`${styles.messageRow} ${styles.botRow}`}>
        <Skeleton.Avatar
          active
          size={32}
          className={`${styles.avatar} ${styles.avatar__logo}`}
        />
        <div className={styles.content}>
          <div className={`${styles.bubble} ${styles.botBubble}`}>
            <div className={styles.botText}>
              <Skeleton.Input
                active
                style={{
                  width: 320,
                  height: 120,
                  padding: "12px 16px",
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
