import { ArrowRightTailIcon, BuildingsIcon } from "@/components/icons";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import { useHotelStore } from "@/store/chat/hotel.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { HotelOption } from "@/utils/types/hotels";
import { Flex, Rate, Space, Typography } from "antd";
import Image from "next/image";
import React, { useState } from "react";
import styles from "./HotelCard.module.scss";

const { Text, Title } = Typography;

interface HotelCardProps {
  hotelName?: string;
  starRating?: number;
  reviewCount?: number;
  reviewScore?: string;
  location?: string;
  price?: number;
  imageUrl?: string;
  hotelData: HotelOption;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotelData }) => {
  const { setHotel, clearRates, fetchRates } = useHotelStore((state) => state);
  const { openSection } = useSplitStore((state) => state);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShowDetails = async () => {
    openSection(SectionMode.HotelDetails);
    clearRates();
    setHotel(hotelData);

    await fetchRates(hotelData.id);
  };

  console.log("hotelData", hotelData);

  const ratingValue = Number(
    Number(hotelData.accommodation.review_score) * 0.4
  ).toFixed(2);

  // Calculate number of nights
  const checkInDate = new Date(hotelData.check_in_date);
  const checkOutDate = new Date(hotelData.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate per-night rate
  const totalAmount = Number(hotelData.cheapest_rate_total_amount);
  const perNightAmount =
    nights > 0 ? (totalAmount / nights).toFixed(2) : totalAmount.toFixed(2);

  return (
    <div className={styles["hotel-card"]}>
      {/* Hotel Image */}
      <div className={styles["hotel-card__image"]}>
        <Image
          src={hotelData.accommodation.photos?.[0]?.url || "/hotel_1.png"}
          alt={hotelData.accommodation.name}
          width={200}
          height={162}
          className={`${styles["hotel-card__image-container"]} ${
            imageLoaded ? styles.loaded : ""
          }`}
          loading="lazy"
          priority={false}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Hotel Content */}
      <div className={styles["hotel-card__content"]}>
        <div className={styles["hotel-card__header"]}>
          {/* Title Row with Name and Stars */}
          <Flex className={styles["hotel-card__title"]} align="center">
            <Title level={5} className={styles["hotel-card__title-text"]}>
              {hotelData.accommodation.name}
            </Title>
            <Rate
              disabled
              count={4}
              defaultValue={0}
              value={Number(ratingValue)}
              className={styles.stars}
            />
          </Flex>

          {/* Reviews */}
          <Text className={styles["hotel-card__reviews"]}>
            Superb - {hotelData.accommodation.ratings?.length} reviews
          </Text>

          {/* Location */}
          <Space
            className={styles["hotel-card__location"]}
            size={4}
            align="center">
            <BuildingsIcon className={styles["hotel-card__location-icon"]} />
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                hotelData.accommodation.location.address.city_name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["hotel-card__location-link"]}>
              <Text className={styles["hotel-card__location-text"]}>
                {hotelData.accommodation.location.address.country_code},
                {hotelData.accommodation.location.address.city_name}
              </Text>
            </a>
          </Space>

          {/* Price Row */}
          <Flex className={styles["hotel-card__price"]} align="center" gap={4}>
            <Text
              className={styles["hotel-card__price-starting"]}
              type="secondary">
              Starting
            </Text>
            <Text className={styles["hotel-card__price-amount"]}>
              ${perNightAmount}
            </Text>
            <Text
              className={styles["hotel-card__price-period"]}
              type="secondary">
              /night
            </Text>
          </Flex>
        </div>

        {/* View Hotel Button */}
        <PaymentButton
          className={styles["hotel-card__button"]}
          onClick={handleShowDetails}
          type="primary"
          size="middle">
          <ArrowRightTailIcon
            className={styles["hotel-card__button-icon"]}
            width={16}
            height={16}
          />
          <span className={styles["hotel-card__button-text"]}>View Hotel</span>
        </PaymentButton>
      </div>
    </div>
  );
};

export default HotelCard;
