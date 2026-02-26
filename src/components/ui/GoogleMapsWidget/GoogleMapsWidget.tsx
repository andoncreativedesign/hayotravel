import { LocationData } from "@/utils/helpers/googleMapsHelper";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./GoogleMapsWidget.module.scss";
import { ArrowLeftTailIcon } from "@/components/icons";
import { Button } from "antd";

interface GoogleMapsWidgetProps {
  location: LocationData;
  isVisible: boolean;
  onClose?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  fullScreen?: boolean;
}

/**
 * Generates Google Maps Embed API URL
 * @param location - Location data
 * @returns Google Maps embed URL
 */
function generateEmbedUrl(location: LocationData): string {
  // Note: In production, you would use the Google Maps Embed API with a real API key
  // const baseUrl = 'https://www.google.com/maps/embed/v1/place';

  // For now, we'll use the basic embed without API key (has limitations)
  const params = new URLSearchParams();

  // If coordinates are available, use them
  if (location.coordinates?.latitude && location.coordinates?.longitude) {
    const query = `${location.coordinates.latitude},${location.coordinates.longitude}`;
    params.append("q", query);
  } else {
    // Otherwise, construct search query from address components
    const queryParts: string[] = [];

    if (location.name) queryParts.push(location.name);
    if (location.address) queryParts.push(location.address);
    if (location.city) queryParts.push(location.city);
    if (location.country) queryParts.push(location.country);

    const query = queryParts.join(", ");
    params.append("q", query);
  }

  // Use basic embed URL without API key (fallback)
  // In production, you would add: &key=YOUR_API_KEY
  return `https://www.google.com/maps?q=${encodeURIComponent(
    params.get("q") || ""
  )}&output=embed`;
}

export default function GoogleMapsWidget({
  location,
  isVisible,
  onClose,
  showBackButton,
  onBack,
  fullScreen,
}: GoogleMapsWidgetProps) {
  const embedUrl = generateEmbedUrl(location);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "100%" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`${styles.mapContainer} ${
            fullScreen ? styles.fullScreen : ""
          }`}>
          <div className={styles.mapHeader}>
            <div className={styles.mapHeaderLeft}>
              {showBackButton && onBack && (
                <Button
                  type="text"
                  icon={<ArrowLeftTailIcon />}
                  onClick={onBack}
                  className={styles.backButton}>
                  Back
                </Button>
              )}
              <span className={styles.mapTitle}>Location</span>
            </div>
            {onClose && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close map">
                ×
              </button>
            )}
          </div>
          <div className={styles.mapWrapper}>
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing ${location.name || "location"}`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
