import { ItineraryHotel } from "@/store/itinerary/itinerary.store";
import { TravelWalletTrip } from "@/utils/types/travel-wallet";
import GoogleMapsWidget from "@/components/ui/GoogleMapsWidget/GoogleMapsWidget";
import { HotelInfo } from "./HotelInfo";
import { useState } from "react";
import styles from "./HotelInfoWithMap.module.scss";

interface HotelInfoWithMapProps {
  hotel: ItineraryHotel;
  trip?: TravelWalletTrip;
  onClose?: () => void;
}

export function HotelInfoWithMap({ hotel, trip, onClose }: HotelInfoWithMapProps) {
  const [showMap, setShowMap] = useState(false);

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  if (showMap) {
    return (
      <div className={styles.mapView}>
        <GoogleMapsWidget
          location={{
            name: hotel.data.name,
            address: hotel.data.location.address,
            city: hotel.data.location.city,
            country: hotel.data.location.country,
          }}
          isVisible={true}
          onClose={handleCloseMap}
          showBackButton={true}
          onBack={handleCloseMap}
          fullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HotelInfo 
        hotel={hotel} 
        trip={trip}
        onClose={onClose} 
        onLocationClick={handleToggleMap}
      />
    </div>
  );
}
