import { TripDetailWrapper } from "@/components/TravelWallet/TripDetailView/TripDetailWrapper";
import styles from "./trip-detail.module.scss";

interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage(props: TripDetailPageProps) {
  const { tripId } = await props.params;

  return (
    <div className={styles.tripDetailPage}>
      <TripDetailWrapper tripId={tripId} />
    </div>
  );
}
