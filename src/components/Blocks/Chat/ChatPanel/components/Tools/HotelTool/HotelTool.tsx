"use client";

import { useHotelStore } from "@/store/chat/hotel.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { HotelOption } from "@/utils/types/hotels";
import { Carousel } from "antd";
import { HotelCard } from "./HotelCard";
import styles from "./HotelTool.module.scss";

export const HotelTool = ({ options }: { options: HotelOption[] }) => {
  const { setIsFullWidth, setSectionMode, setIsRightPanelOpen } = useSplitStore(
    (state) => state
  );
  const { setHotel, fetchRates, clearRates } = useHotelStore((state) => state);

  const handleShowMap = () => {
    setIsFullWidth(false);
    setSectionMode(SectionMode.Map);
  };

  const handleMoreDetails = async (hotel: HotelOption) => {
    setIsRightPanelOpen(true);
    setIsFullWidth(false);
    setSectionMode(SectionMode.HotelDetails);
    
    clearRates();
    setHotel(hotel);
    
    await fetchRates(hotel.id);
  };

  return (
    <div className={styles.container}>
      <Carousel
        dots={{ className: styles.dots }}
        infinite={false}
        slidesToShow={2}
        slidesToScroll={1}
        adaptiveHeight>
        {options.map((option) => (
          <div key={option.id} className={styles.slide}>
            <HotelCard
              option={option}
              onShowMap={handleShowMap}
              onShowDetails={handleMoreDetails}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
