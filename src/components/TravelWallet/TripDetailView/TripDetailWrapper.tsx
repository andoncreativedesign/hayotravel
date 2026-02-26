"use client";
import { useTravelWalletStore } from "@/store/travel-wallet/travel-wallet.store";
import { getTravelWalletTripById } from "@/utils/api/travel-wallet";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { useEffect } from "react";
import { SplitWalletDetails } from "../SplitWalletDetails/SplitWalletDetails";
import styles from "./TripDetailView.module.scss";

interface TripDetailWrapperProps {
  tripId: string;
  rightContent?: React.ReactNode;
}

export function TripDetailWrapper({
  tripId,
  rightContent,
}: TripDetailWrapperProps) {
  const { setSelectedTrip, updateTrip } = useTravelWalletStore();

  const {
    data: trip,
    isPending,
    isError,
  } = useQuery<TravelWalletTrip>({
    queryKey: ["trip", tripId],
    queryFn: () => getTravelWalletTripById(tripId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update store when trip data is fetched
  useEffect(() => {
    if (trip) {
      setSelectedTrip(trip);
      updateTrip(tripId, trip);
    }
  }, [trip, tripId, setSelectedTrip, updateTrip]);

  if (isPending) {
    return (
      <div className={styles.tripDetailView}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "16px",
          }}>
          <Spin size="large" />
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className={styles.tripDetailView}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "16px",
          }}>
          <h2>Failed to load trip details</h2>
          <p>
            The trip you&apos;re looking for doesn&apos;t exist or couldn&apos;t
            be loaded.
          </p>
        </div>
      </div>
    );
  }

  return <SplitWalletDetails trip={trip} rightContent={rightContent} />;
}
