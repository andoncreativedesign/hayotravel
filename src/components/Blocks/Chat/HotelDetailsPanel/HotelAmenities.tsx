"use client";

import BarbellIcon from "@/components/icons/Barbell";
import CarSimpleIcon from "@/components/icons/CarSimple";
import CoffeeIcon from "@/components/icons/Coffee";
import UsersIcon from "@/components/icons/Users";
import WavesIcon from "@/components/icons/Waves";
import WifiHighIcon from "@/components/icons/WifiHigh";
import { useHotelStore } from "@/store/chat/hotel.store";
import { Typography } from "antd";
import styles from "./HotelAmenities.module.scss";

const { Text } = Typography;

// Default amenities mapping for common types
const amenityIconMap: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; text: string }
> = {
  wifi: { icon: WifiHighIcon, text: "Free WiFi" },
  breakfast: { icon: CoffeeIcon, text: "Breakfast" },
  gym: { icon: BarbellIcon, text: "Gym" },
  parking: { icon: CarSimpleIcon, text: "Parking" },
  pool: { icon: WavesIcon, text: "Pool" },
  family: { icon: UsersIcon, text: "Family friendly" },
};

// Default amenities as fallback
const defaultAmenities = [
  { icon: WifiHighIcon, text: "Free WiFi", key: "wifi" },
  { icon: CoffeeIcon, text: "Breakfast", key: "breakfast" },
  { icon: BarbellIcon, text: "Gym", key: "gym" },
  { icon: CarSimpleIcon, text: "Parking", key: "parking" },
  { icon: WavesIcon, text: "Pool", key: "pool" },
  { icon: UsersIcon, text: "Family friendly", key: "family" },
];

const HotelAmenities = () => {
  const { hotel: option } = useHotelStore((state) => state);

  if (!option) {
    return (
      <div className={styles.amenities}>
        <Text className={styles.amenitiesTitle}>Popular Amenities</Text>
        <Text>TDA</Text>
      </div>
    );
  }

  // Get amenities from hotel data
  const hotelAmenities = option.accommodation.amenities || [];

  // If no amenities data, show TDA
  if (hotelAmenities.length === 0) {
    return (
      <div className={styles.amenities}>
        <Text className={styles.amenitiesTitle}>Popular Amenities</Text>
        <Text>TDA</Text>
      </div>
    );
  }

  // Map hotel amenities to our icon system, with fallback to default icons
  const mappedAmenities = hotelAmenities.slice(0, 6).map((amenity, index) => {
    const amenityType = amenity.type.toLowerCase();
    const mappedAmenity = amenityIconMap[amenityType];

    if (mappedAmenity) {
      return {
        icon: mappedAmenity.icon,
        text: amenity.description || mappedAmenity.text,
        key: amenityType,
      };
    }

    // Fallback to default amenities if mapping not found
    const fallback = defaultAmenities[index % defaultAmenities.length];
    return {
      icon: fallback.icon,
      text: amenity.description || fallback.text,
      key: amenity.type,
    };
  });

  // Ensure we have at least 6 amenities for the grid
  const displayAmenities =
    mappedAmenities.length >= 6
      ? mappedAmenities
      : [
          ...mappedAmenities,
          ...defaultAmenities.slice(mappedAmenities.length, 6),
        ];

  return (
    <div className={styles.amenities}>
      <Text className={styles.amenitiesTitle}>Popular Amenities</Text>
      <div className={styles.amenitiesGrid}>
        <div className={styles.amenitiesList}>
          {displayAmenities.slice(0, 3).map((amenity, index) => {
            const IconComponent = amenity.icon;
            return (
              <div
                key={`${amenity.key}-${index}`}
                className={styles.amenityItem}>
                <IconComponent className={styles.amenityIcon} />
                <Text className={styles.amenityText}>{amenity.text}</Text>
              </div>
            );
          })}
        </div>
        <div className={styles.amenitiesList}>
          {displayAmenities.slice(3, 6).map((amenity, index) => {
            const IconComponent = amenity.icon;
            return (
              <div
                key={`${amenity.key}-${index + 3}`}
                className={styles.amenityItem}>
                <IconComponent className={styles.amenityIcon} />
                <Text className={styles.amenityText}>{amenity.text}</Text>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HotelAmenities;
