"use client";

import BuildingsIcon from "@/components/icons/Buildings";
import { HotelActions } from "@/store/chat/hotel.store";
import { HotelOption } from "@/utils/types/hotels";
import { Button, Flex, Rate, Typography } from "antd";
import Image from "next/image";
import React from "react";
import styles from "./HotelCard.module.scss";

const { Title, Text } = Typography;

interface HotelCardProps {
  option: HotelOption;
  onShowMap: () => void;
  onShowDetails: HotelActions["setHotel"];
}

export const HotelCard: React.FC<HotelCardProps> = ({
  option,
  onShowMap,
  onShowDetails,
}) => {
  // Extract data from the new structure
  const { accommodation } = option;
  const hotelName = accommodation.name;
  const totalAmount = parseFloat(option.cheapest_rate_total_amount);
  // Calculate approximate price per night (assuming 5 nights for the mock data)
  const checkInDate = new Date(option.check_in_date);
  const checkOutDate = new Date(option.check_out_date);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const pricePerNight = Math.round(totalAmount / nights);

  // Get first photo or fallback
  const imageUrl = accommodation.photos?.[0]?.url || "/hotel_1.png";

  // Location from address
  const location = `${accommodation.location.address.city_name}, ${accommodation.location.address.country_code}`;

  // Rating - use rating if available, otherwise use review_score converted to 5-star scale
  const ratingValue =
    accommodation.rating ||
    (accommodation.review_score
      ? Math.round((accommodation.review_score / 10) * 5)
      : 4);

  // Get review count from ratings or use placeholder
  const reviewsCount = accommodation.ratings?.length > 0 ? 832 : 0; // placeholder

  return (
    <Flex vertical className={styles.card}>
      <Image
        alt={hotelName}
        src={imageUrl}
        className={styles.card__cover}
        width={300}
        height={146}
      />
      <Flex vertical gap={8} className={styles.card__content}>
        <Flex vertical gap={4}>
          <Flex gap={4} align="center">
            <Title level={4} className={styles.card__title}>
              {hotelName}
            </Title>
            <Rate
              disabled
              count={5}
              defaultValue={ratingValue}
              className={styles.stars}
            />
          </Flex>
          <Text type="secondary" className={styles.card__reviews}>
            {accommodation.review_score
              ? `${accommodation.review_score}/10`
              : "Superb"}{" "}
            – {reviewsCount} reviews
          </Text>
          <Flex gap={4} className={styles.card__location}>
            <BuildingsIcon />
            <Text className={styles.card__location__text}>{location}</Text>
          </Flex>
        </Flex>
        <Text className={styles.card__price}>
          Starting{" "}
          <span className={styles.card__price__value}>${pricePerNight}</span>{" "}
          /night
        </Text>
        <Flex gap={8} justify="space-between" className={styles.actions}>
          <Button type="default" onClick={onShowMap} className={styles.btn}>
            Show on Map
          </Button>
          <Button
            type="primary"
            className={styles.btnPrimary}
            onClick={() => onShowDetails(option)}>
            More Details
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
