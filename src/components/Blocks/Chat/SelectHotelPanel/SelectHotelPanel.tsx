import { XIcon } from "@/components/icons";
import { useChatStore } from "@/store/chat/chats.store";
import { useSplitStore } from "@/store/chat/split.store";
import { Button, Typography } from "antd";
import HotelCard from "./HotelCard";
import styles from "./SelectHotelPanel.module.scss";

const { Text } = Typography;

const SelectHotelPanel = () => {
  const { hotelSectionData } = useChatStore();
  const { setIsRightPanelOpen } = useSplitStore();
  return (
    <div className={styles.panel__wrapper}>
      <div className={styles.panel__header}>
        <div className={styles.panel__header__controls}>
          <Text className={styles.panel__header__controls__text}>
            YOUR HOTELS
          </Text>
          <Button
            type="text"
            className={styles.panel__header__controls__button}
            icon={<XIcon width={20} height={20} />}
            onClick={() => setIsRightPanelOpen(false)}
          />
        </div>
      </div>
      <div className={styles.panel__content}>
        {hotelSectionData.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotelData={hotel}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectHotelPanel;
