import { XIcon } from "@/components/icons";
import { useChatStore } from "@/store/chat/chats.store";
import { useSplitStore } from "@/store/chat/split.store";
import { Button, Typography } from "antd";
import { useState } from "react";
import { FlightTool } from "../ChatPanel/components/Tools/FlightTool";
import styles from "./SelectFlightPanel.module.scss";

const { Title, Text } = Typography;

const SelectFlightPanel = () => {
  const [currentOption, setCurrentOption] = useState(0);

  const { flightSectionData } = useChatStore();
  const { setIsRightPanelOpen } = useSplitStore();
  const handleSlideChange = (current: number) => {
    setCurrentOption(current);
  };
  return (
    <div className={styles.panel__wrapper}>
      <div className={styles.panel__header}>
        <div className={styles.panel__header__controls}>
          <Text className={styles.panel__header__controls__text}>
            YOUR FLIGHTS
          </Text>
          <Button
            type="text"
            className={styles.panel__header__controls__button}
            icon={<XIcon width={20} height={20} />}
            onClick={() => setIsRightPanelOpen(false)}
          />
        </div>
        <div className={styles.panel__header__title__wrapper}>
          <Title className={styles.panel__header__title} level={5}>
            Round trip
          </Title>
          <Text className={styles.panel__header__title__text}>
            Option {currentOption + 1}/3
          </Text>
        </div>
      </div>
      <FlightTool
        options={flightSectionData}
        onSlideChange={handleSlideChange}
      />
    </div>
  );
};

export default SelectFlightPanel;
