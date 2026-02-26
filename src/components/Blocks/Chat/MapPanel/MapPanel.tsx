import { ArrowLineRightIcon } from "@/components/icons";
import { useSplitStore } from "@/store/chat/split.store";
import { Button, Tooltip } from "antd";
import Image from "next/image";
import React from "react";
import styles from "./MapPanel.module.scss";

const MapPanel: React.FC = () => {
  const { isFullWidth, setIsFullWidth } = useSplitStore((state) => state);

  return (
    <div className={styles.map__wrapper}>
      <div className={styles.map__controls}>
        <Tooltip title={isFullWidth ? "Collapse" : "Expand"}>
          <Button
            style={{ transform: `rotate(${isFullWidth ? 180 : 0}deg)` }}
            shape="circle"
            onClick={() => setIsFullWidth(!isFullWidth)}
            icon={<ArrowLineRightIcon />}
          />
        </Tooltip>
      </div>
      <Image
        src="/map.png"
        alt="Map"
        className={styles.map}
        width={660}
        height={840}
      />
    </div>
  );
};

export default MapPanel;
