"use client";

import { CalendarIcon, MapMarkIcon } from "@/components/icons";
import { useDestinationPhoto } from "@/hooks/useDestinationPhoto";
import { formatDateShort } from "@/utils/helpers/transformDates";
import { getPhotoAttribution } from "@/utils/services/unsplashService";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { Card, Skeleton } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./TripCard.module.scss";

interface TripCardProps {
  trip: TravelWalletTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  // Use React Query hook for destination photo fetching
  const {
    data: destinationPhoto,
    isLoading: isLoadingPhoto,
    isError: hasPhotoError,
    error: photoError,
  } = useDestinationPhoto(trip.destination);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDateShort(new Date(startDate));
    const end = formatDateShort(new Date(endDate));
    const yearEnd = new Date(endDate).getFullYear();
    return `${start} - ${end}, ${yearEnd}`;
  };

  const handleCardClick = () => {
    router.push(`/travel-wallet/${trip.id}`);
  };

  // Log photo errors for debugging (optional)
  if (hasPhotoError && photoError) {
    console.error("Error fetching destination photo:", photoError);
  }

  return (
    <Card
      className={styles["trip-card"]}
      onClick={handleCardClick}
      hoverable
      cover={
        <div className={styles["trip-card__image-container"]}>
          {isLoadingPhoto ? (
            <Skeleton.Image active style={{ width: "100%", height: "200px" }} />
          ) : destinationPhoto && !hasPhotoError ? (
            <Image
              src={destinationPhoto.urls.regular}
              alt={
                destinationPhoto.alt_description ||
                `${trip.destination} destination`
              }
              fill
              className={styles["trip-card__image"]}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => {
                // Image loading error - React Query will handle retry logic
                console.warn(`Failed to load image for ${trip.destination}`);
              }}
            />
          ) : (
            <Image
              src={"/bg_wallet_card.jpg"}
              alt={`${trip.destination} preview`}
              fill
              className={styles["trip-card__image"]}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          {/* Photo attribution overlay */}
          {destinationPhoto && !hasPhotoError && !isLoadingPhoto && (
            <div className={styles["trip-card__photo-attribution"]}>
              <span>
                Photo by{" "}
                <a
                  href={getPhotoAttribution(destinationPhoto).photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}>
                  {getPhotoAttribution(destinationPhoto).photographer}
                </a>{" "}
                on{" "}
                <a
                  href={getPhotoAttribution(destinationPhoto).unsplashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}>
                  Unsplash
                </a>
              </span>
            </div>
          )}
        </div>
      }>
      <div className={styles["trip-card__content"]}>
        <div className={styles["trip-card__header"]}>
          <h3 className={styles["trip-card__title"]}>
            {trip.metadata.chatMetadata?.title as string}
          </h3>
        </div>

        <div className={styles["trip-card__tags"]}>
          <div className={styles["trip-card__tag"]}>
            <MapMarkIcon className={styles["trip-card__tag__icon"]} />
            <span className={styles["trip-card__tag__text"]}>
              {trip.destination}
            </span>
          </div>
          <div className={styles["trip-card__tag"]}>
            <CalendarIcon className={styles["trip-card__tag__icon"]} />
            <span className={styles["trip-card__tag__text"]}>
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
