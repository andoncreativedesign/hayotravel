"use client";
import { useDocumentTitle } from "@/hooks";
import {
  useTravelWalletStore,
  useTravelWalletTrips,
} from "@/store/travel-wallet/travel-wallet.store";
import { getTravelWalletTrips } from "@/utils/api/travel-wallet";
import {
  TravelWalletQuery,
  TravelWalletTripStatus,
} from "@/utils/types/travel-wallet";
import { LoadingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Segmented, Spin } from "antd";
import { useEffect, useState } from "react";
import { TripCard } from "../TripCard";
import styles from "./TravelWalletPanel.module.scss";

type FilterTab = "upcoming" | "past" | "all";

export function TravelWalletPanel() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("upcoming");
  const trips = useTravelWalletTrips();
  // Set page title
  useDocumentTitle("Travel Wallet");
  const { setTrips } = useTravelWalletStore();

  // Build query based on active filter
  const query: TravelWalletQuery = {
    status: (() => {
      switch (activeFilter) {
        case "upcoming":
          return [
            TravelWalletTripStatus.Upcoming,
            TravelWalletTripStatus.Active,
          ];
        case "past":
          return [TravelWalletTripStatus.Past];
        case "all":
          return undefined;
        default:
          return undefined;
      }
    })(),
    sortBy: "startDate",
    sortOrder: activeFilter === "past" ? "desc" : "asc",
    limit: 20,
    page: 0,
  };

  // Use TanStack Query to fetch trips
  const {
    data: apiResponse,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["travel-wallet-trips", activeFilter],
    queryFn: () => getTravelWalletTrips(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data is fetched successfully
  useEffect(() => {
    if (apiResponse?.trips) {
      setTrips(apiResponse.trips);
    }
  }, [apiResponse, setTrips]);

  // Filter trips based on active tab (with safety guard)
  const filteredTrips = (trips || []).filter((trip) => {
    switch (activeFilter) {
      case "upcoming":
        return (
          trip.status === TravelWalletTripStatus.Upcoming ||
          trip.status === TravelWalletTripStatus.Active
        );
      case "past":
        return trip.status === TravelWalletTripStatus.Past;
      case "all":
        return true;
      default:
        return true;
    }
  });

  const filterOptions = [
    { label: "Upcoming", value: "upcoming" as FilterTab },
    { label: "Past", value: "past" as FilterTab },
    { label: "All", value: "all" as FilterTab },
  ];

  return (
    <div className={styles.travelWalletPanel}>
      {/* Filter Tabs */}
      <div className={styles.filterSection}>
        <Segmented
          options={filterOptions}
          value={activeFilter}
          onChange={setActiveFilter}
          className={styles.filterTabs}
        />
      </div>

      {/* Trip List */}
      <div className={styles.tripsSection}>
        {isPending ? (
          <div className={styles.loadingState}>
            <Spin indicator={<LoadingOutlined spin />} size="large" />
            <p>Loading your trips...</p>
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h3>Error loading trips</h3>
            <p>
              Something went wrong while loading your trips. Please try again.
            </p>
            <Button
              type="primary"
              onClick={() => refetch()}
              loading={isPending}
              size="large">
              Retry
            </Button>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✈️</div>
            <h3>No trips found</h3>
            <p>
              {activeFilter === "upcoming"
                ? "You don't have any upcoming trips yet. Start planning your next adventure!"
                : activeFilter === "past"
                ? "No past trips to display. Your travel history will appear here after you complete your bookings."
                : "No trips to display. Start planning your first trip with Hayo!"}
            </p>
          </div>
        ) : (
          <div className={styles.tripsList}>
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
