import { SectionMode } from "@/store/chat/split.store";
import { AnimatePresence, motion } from "framer-motion";
import HotelDetailsPanel from "../HotelDetailsPanel/HotelDetailsPanel";
import ItineraryPanel from "../ItineraryPanel/ItineraryPanel";
import MapPanel from "../MapPanel/MapPanel";
import SelectFlightPanel from "../SelectFlightPanel/SelectFlightPanel";
import SelectHotelPanel from "../SelectHotelPanel/SelectHotelPanel";

interface RightSectionProps {
  mode: SectionMode;
  setIsFullWidth: (value: boolean) => void;
  isFullWidth: boolean;
  chatId: string;
}

const RightSectionContent = ({
  mode,
  chatId,
}: Pick<RightSectionProps, "mode" | "chatId">) => {
  switch (mode) {
    case SectionMode.Map:
      return <MapPanel />;
    case SectionMode.Itinerary:
      return <ItineraryPanel chatId={chatId} />;
    case SectionMode.HotelDetails:
      return <HotelDetailsPanel />;
    case SectionMode.SelectFlight:
      return <SelectFlightPanel />;
    case SectionMode.SelectHotel:
      return <SelectHotelPanel />;
    default:
      return null;
  }
};

export const RightSection = ({ mode, chatId }: RightSectionProps) => {
  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        style={{ height: "100%" }}>
        <RightSectionContent mode={mode} chatId={chatId} />
      </motion.div>
    </AnimatePresence>
  );
};
