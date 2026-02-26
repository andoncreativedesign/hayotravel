import { DuffelOfferDetails, getFlightNumber } from "@/utils/api/duffel";
import { Divider, Typography } from "antd";
import styles from "./ExpandedFlightDetails.module.scss";

const { Text } = Typography;

interface ExpandedFlightDetailsProps {
  departureDate: string;
  departureTime: string;
  duration: string;
  arrivalTime: string;
  arrivalDate: string;
  originCity: string | null;
  originAirport: string | null;
  destinationCity: string | null;
  destinationAirport: string;
  flightType: string;
  operatingCarrier: {
    id: string;
    name: string;
  };
  marketingCarrier?: {
    id: string;
    name: string;
  };
  offerDetails?: DuffelOfferDetails;
  flightDirection?: "outbound" | "return";
}

const ExpandedFlightDetails = ({
  departureDate,
  departureTime,
  duration,
  arrivalTime,
  arrivalDate,
  originCity,
  originAirport,
  destinationCity,
  destinationAirport,
  flightType,
  operatingCarrier,
  marketingCarrier,
  offerDetails,
  flightDirection = "outbound",
}: ExpandedFlightDetailsProps) => {
  const getEnhancedFlightInfo = () => {
    if (!offerDetails) {
      return null;
    }

    const sliceIndex = flightDirection === "return" ? 1 : 0;
    const slice = offerDetails.data?.slices?.[sliceIndex];

    if (!slice || !slice.segments?.[0]) {
      return null;
    }

    const firstSegment = slice.segments[0];
    const lastSegment = slice.segments[slice.segments.length - 1];

    return {
      flightNumber: getFlightNumber(firstSegment),
      marketingCarrier: firstSegment.marketing_carrier,
      operatingCarrier: firstSegment.operating_carrier,
      isDirectFlight: slice.segments.length === 1,
      originAirport: {
        code: firstSegment.origin.iata_code,
        name: firstSegment.origin.name,
        city: firstSegment.origin.city_name || firstSegment.origin.name,
      },
      destinationAirport: {
        code: lastSegment.destination.iata_code,
        name: lastSegment.destination.name,
        city: lastSegment.destination.city_name || lastSegment.destination.name,
      },
    };
  };

  const enhancedInfo = getEnhancedFlightInfo();

  return (
    <div className={styles.expandedDetails}>
      <Text>Flight information:</Text>
      <div className={styles.flightDirection}>
        {/* Time Section */}
        <div className={styles.timeSection}>
          <div className={styles.timeFrame}>
            <Text className={styles.time}>{departureTime}</Text>
            <Text className={styles.timeDate}>{departureDate}</Text>
          </div>
          <Text className={styles.duration}>{formatDuration(duration)}</Text>
          <div className={styles.timeFrame}>
            <Text className={styles.time}>{arrivalTime}</Text>
            <Text className={styles.timeDate}>{arrivalDate}</Text>
          </div>
        </div>

        {/* Timeline Divider */}
        <div className={styles.timelineDivider}>
          <div className={styles.timelineCircle}></div>
          <Divider
            className={styles.timelineLine}
            variant="dashed"
            type="vertical"
          />
          <div className={styles.timelineCircle}></div>
        </div>

        {/* Airport Section */}
        <div className={styles.airportSection}>
          <div className={styles.airportInfo}>
            <Text className={styles.cityName}>
              {enhancedInfo ? enhancedInfo.originAirport.city : originCity}
            </Text>
            <Text className={styles.airportName}>
              {enhancedInfo
                ? `${enhancedInfo.originAirport.code} - ${enhancedInfo.originAirport.name}`
                : originAirport}
            </Text>
          </div>
          <div className={styles.flightInfo}>
            <Text className={styles.flightType}>
              {enhancedInfo?.isDirectFlight ? "Direct flight" : flightType}
            </Text>
            <Text className={styles.flightType}>
              {enhancedInfo ? (
                <>
                  {enhancedInfo.marketingCarrier.name}{" "}
                  {enhancedInfo.flightNumber}
                  {enhancedInfo.marketingCarrier.id !==
                    enhancedInfo.operatingCarrier.id &&
                    enhancedInfo.operatingCarrier.name &&
                    ` (Operated by ${enhancedInfo.operatingCarrier.name})`}
                </>
              ) : (
                <>
                  {operatingCarrier.name}
                  {operatingCarrier?.id !== marketingCarrier?.id &&
                    marketingCarrier?.name &&
                    ` (Operated by ${marketingCarrier.name})`}
                </>
              )}
            </Text>
          </div>
          <div className={styles.airportInfo}>
            <Text className={styles.cityName}>
              {enhancedInfo
                ? enhancedInfo.destinationAirport.city
                : destinationCity}
            </Text>
            <Text className={styles.airportName}>
              {enhancedInfo
                ? `${enhancedInfo.destinationAirport.code} - ${enhancedInfo.destinationAirport.name}`
                : destinationAirport}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedFlightDetails;

// Helper function to format ISO duration to readable format
const formatDuration = (duration: string) => {
  const match = duration.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?$/);
  if (!match) return duration;

  const days = parseInt(match?.[1] ?? "0");
  const hours = parseInt(match?.[2] ?? "0");
  const minutes = parseInt(match?.[3] ?? "0");

  const totalHours = days * 24 + hours;

  if (totalHours > 0) {
    return `${totalHours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
