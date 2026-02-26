import {
  Itinerary,
  ItineraryHotel,
  ItineraryType,
} from "@/store/itinerary/itinerary.store";
import { DisplayItem, ItineraryFlightItem } from "./ItineraryFlightItem";
import ItineraryHotelItem from "./ItineraryHotelItem";

interface ItineraryItemProps {
  item: Itinerary;
}

const ItineraryItem = ({ item }: ItineraryItemProps) => {
  switch (item.type) {
    case ItineraryType.Flight:
      return <ItineraryFlightItem item={item as DisplayItem} />;
    case ItineraryType.Hotel:
      return <ItineraryHotelItem item={item as ItineraryHotel} />;
  }
};

export default ItineraryItem;
