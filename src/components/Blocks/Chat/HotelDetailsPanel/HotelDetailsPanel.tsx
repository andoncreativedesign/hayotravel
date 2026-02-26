"use client";

import { ArrowLeftTailIcon, XIcon } from "@/components/icons";
import BuildingsIcon from "@/components/icons/Buildings";
import MapMarkIcon from "@/components/icons/MapMark";
import { useHotelStore } from "@/store/chat/hotel.store";
import { SectionMode, useSplitStore } from "@/store/chat/split.store";
import { formatTime24To12Hour } from "@/utils/helpers/transformDates";
import { Alert, Button, Divider, Rate, Space, Spin, Typography } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import HotelAmenities from "./HotelAmenities";
import styles from "./HotelDetailsPanel.module.scss";
import RoomOptions from "./RoomOptions";

const { Text, Title } = Typography;

const HotelDetailsPanel = () => {
  const {
    hotel: option,
    isLoadingRates,
    ratesError,
    hotelRates,
  } = useHotelStore((state) => state);
  const { openSection, setIsRightPanelOpen } = useSplitStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const scrollContainer = document.querySelector(
      `.${styles.scrollableContent}`
    );

    if (element && scrollContainer) {
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const offsetTop =
        elementTop - containerTop + scrollContainer.scrollTop - 100; // 100px offset for sticky header

      scrollContainer.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveTab(sectionId);
    }
  };

  // Scroll listener to update active tab based on visible section
  useEffect(() => {
    const handleScroll = () => {
      const overviewElement = document.getElementById("overview");
      const roomOptionsElement = document.getElementById("room-options");
      const scrollContainer = document.querySelector(
        `.${styles.scrollableContent}`
      );

      if (!overviewElement || !roomOptionsElement || !scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const containerTop = scrollContainer.getBoundingClientRect().top;

      const overviewTop =
        overviewElement.getBoundingClientRect().top - containerTop + scrollTop;
      const roomOptionsTop =
        roomOptionsElement.getBoundingClientRect().top -
        containerTop +
        scrollTop;

      const offset = 150; // Offset for sticky headers

      if (scrollTop + offset >= roomOptionsTop) {
        setActiveTab("room-options");
      } else if (scrollTop + offset >= overviewTop) {
        setActiveTab("overview");
      }
    };

    const scrollContainer = document.querySelector(
      `.${styles.scrollableContent}`
    );
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Initial call to set correct active tab
      handleScroll();
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  if (!option) return null;

  // Use updated hotel data if available, otherwise fall back to original
  const hotelData = hotelRates?.data || option;

  const accommodation = hotelData?.accommodation;
  const photos = accommodation.photos;

  // Get first 3 photos for display
  const mainPhoto = photos[0]?.url || "/hotel_1.png";
  const secondPhoto = photos[1]?.url || "/hotel_1.png";
  const thirdPhoto = photos[2]?.url || "/hotel_1.png";
  const totalPhotos = photos.length;

  // Hotel details
  const hotelName = accommodation.name;
  const rating = Number(
    Number(hotelData.accommodation.review_score) * 0.4
  ).toFixed(2);
  const location = accommodation.location;
  const cityName = location.address.city_name;
  const countryCode = location.address.country_code;

  // Check-in/check-out data
  const checkInTime =
    accommodation.check_in_information?.check_in_after_time || "TDA";
  const checkOutTime =
    accommodation.check_in_information?.check_out_before_time || "TDA";

  // Hotel description
  const hotelDescription = accommodation.description || "TDA";

  // Tab items for navigation
  const tabItems = [
    { key: "overview", title: "Overview" },
    { key: "room-options", title: "Room options" },
  ];

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <div className={styles.header}>
        <div
          className={styles["header-left"]}
          onClick={() => {
            openSection(SectionMode.SelectHotel);
          }}>
          <ArrowLeftTailIcon />
          <Text className={styles["header-text"]}>Back to Hotels</Text>
        </div>
        <Button
          className={styles["header-back"]}
          type="text"
          size="small"
          icon={<XIcon />}
          onClick={() => {
            setIsRightPanelOpen(false);
          }}
        />
      </div>

      {/* Scrollable Content */}
      <div className={styles.scrollableContent}>
        {/* Photos and Hotel Info */}
        <div className={styles.contentWrapper}>
          <div className={styles.photos}>
            {/* Left main photo */}
            <div className={styles.leftPhoto}>
              <Image
                src={mainPhoto}
                alt={`${accommodation.name} main photo`}
                fill
                className={styles.mainImage}
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Right side photos */}
            <div className={styles.rightPhotos}>
              {/* Top right photo */}
              <div className={styles.smallPhoto}>
                <Image
                  src={secondPhoto}
                  alt={`${accommodation.name} photo 2`}
                  fill
                  className={styles.smallImage}
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Bottom right photo with overlay */}
              <div className={styles.smallPhoto}>
                <Image
                  src={thirdPhoto}
                  alt={`${accommodation.name} photo 3`}
                  fill
                  className={styles.smallImage}
                  style={{ objectFit: "cover" }}
                />
                {totalPhotos > 3 && (
                  <div className={styles.overlay}>
                    <Text className={styles.overlayText}>View all photos</Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hotel Content Section */}
          <div className={styles.content}>
            {/* Top section with name and stars */}
            <div className={styles.top}>
              <div className={styles.top__content}>
                <Title level={3} className={styles.hotelName}>
                  {hotelName}
                </Title>
                <div className={styles.stars}>
                  <Rate
                    disabled
                    count={4}
                    defaultValue={0}
                    value={Number(rating)}
                    className={styles.starRating}
                  />
                </div>
              </div>
              {hotelRates && (
                <div style={{ marginTop: "8px" }}>
                  <Text style={{ fontSize: "12px", color: "#52c41a" }}>
                    ✓ Updated rates loaded
                  </Text>
                  {option.cheapest_rate_total_amount !==
                    hotelData.cheapest_rate_total_amount && (
                    <div style={{ marginTop: "4px" }}>
                      <Text style={{ fontSize: "11px", color: "#1890ff" }}>
                        Price updated: ${option.cheapest_rate_total_amount} → $
                        {hotelData.cheapest_rate_total_amount}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom section with reviews and location */}
            <div className={styles.bottom}>
              <div className={styles.bottomContent}>
                {/* Review section */}
                <div className={styles.review}>
                  <div className={styles.reviewStar}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none">
                      <path
                        d="M6.99981 0.871582C7.18275 0.871583 7.36137 0.927719 7.51122 1.03265C7.65753 1.13512 7.76908 1.27947 7.83251 1.44623H7.83294L9.03607 4.47583C9.03729 4.47891 9.03876 4.48212 9.03991 4.48523C9.04102 4.48822 9.0429 4.49102 9.04547 4.49292C9.04797 4.49474 9.05092 4.49571 9.05401 4.49591L9.057 4.49634L12.2836 4.70398C13.121 4.75836 13.4068 5.80617 12.7975 6.31299L12.798 6.31342L10.3259 8.37488L10.3246 8.37616C10.3191 8.38074 10.3149 8.38685 10.3127 8.39368C10.3105 8.40028 10.3103 8.40741 10.3118 8.41418L11.1099 11.5515V11.5519C11.3031 12.3144 10.4795 13.0008 9.76324 12.5491L9.76238 12.5482L7.00579 10.7982C7.00404 10.7971 7.00189 10.7965 6.99981 10.7965C6.99773 10.7965 6.99558 10.7971 6.99383 10.7982L6.9934 10.7986L4.42864 12.4218L4.42907 12.4222C3.64312 12.9222 2.73501 12.1622 2.94994 11.3212L3.68737 8.41461C3.68904 8.40769 3.68917 8.40044 3.68694 8.39368C3.68468 8.38685 3.68052 8.38074 3.67498 8.37616L3.67327 8.37488V8.37445L1.20165 6.31342L1.20208 6.31299C0.592843 5.80617 0.8786 4.75836 1.71606 4.70398L4.94262 4.49634L4.94561 4.49591C4.9487 4.49571 4.95165 4.49474 4.95416 4.49292C4.95672 4.49102 4.9586 4.48822 4.95971 4.48523C4.96086 4.48212 4.96233 4.47891 4.96356 4.47583L6.16668 1.44623C6.2301 1.27941 6.34205 1.13515 6.4884 1.03265C6.63825 0.92772 6.81687 0.871582 6.99981 0.871582ZM6.99041 1.74957C6.98769 1.75148 6.98559 1.75415 6.98443 1.75726C6.98298 1.76125 6.9813 1.76528 6.97973 1.76923L5.78002 4.789L5.78045 4.78943C5.72023 4.95181 5.61377 5.09317 5.47454 5.19617C5.33592 5.29871 5.17066 5.35875 4.99859 5.3692L4.99902 5.36963L1.77245 5.57684L1.77288 5.57727C1.76641 5.57769 1.76353 5.57853 1.76348 5.57855C1.76331 5.57862 1.76313 5.57898 1.76263 5.57941C1.76096 5.58085 1.75552 5.58666 1.75195 5.59821C1.74835 5.60991 1.74912 5.6201 1.75067 5.62598C1.75134 5.62854 1.75222 5.63036 1.75323 5.63196L1.76135 5.64093L1.7622 5.64136L4.23211 7.70196H4.23254C4.36511 7.8116 4.46408 7.95642 4.51794 8.11981C4.5718 8.28325 4.57818 8.45865 4.53674 8.62567L4.53631 8.62781L3.79803 11.5374V11.5382C3.78229 11.6 3.80381 11.648 3.84374 11.6783C3.86419 11.6939 3.8851 11.7003 3.90142 11.7014C3.91492 11.7023 3.93364 11.7004 3.95953 11.6839L3.96038 11.6835L6.52514 10.0595C6.6671 9.9694 6.83167 9.92151 6.99981 9.92151C7.16796 9.92151 7.33253 9.9694 7.47448 10.0595H7.47491L10.2302 11.8091L10.2388 11.8129C10.239 11.8129 10.2434 11.8128 10.2494 11.8082C10.256 11.8032 10.2603 11.7971 10.2623 11.792C10.2631 11.7897 10.2634 11.787 10.2635 11.7839C10.2637 11.7809 10.2639 11.7755 10.2618 11.7672L9.46331 8.62823L9.46288 8.62567C9.42144 8.45865 9.42782 8.28325 9.48168 8.11981C9.5288 7.97688 9.61036 7.84808 9.71881 7.74469L9.76708 7.70196L12.2374 5.64136L12.2383 5.64093C12.2434 5.63668 12.2455 5.63342 12.2464 5.63196C12.2474 5.63036 12.2483 5.62854 12.249 5.62598C12.2505 5.6201 12.2513 5.60991 12.2477 5.59821C12.2441 5.58666 12.2387 5.58086 12.237 5.57941C12.2365 5.57899 12.2363 5.57862 12.2361 5.57855C12.2361 5.57853 12.2332 5.57769 12.2267 5.57727V5.57684L9.0006 5.36963V5.3692C8.82869 5.35867 8.66358 5.29862 8.52508 5.19617C8.38585 5.09317 8.27939 4.95181 8.21917 4.78943V4.789L7.01989 1.76923C7.01832 1.76528 7.01664 1.76125 7.01519 1.75726C7.01403 1.75415 7.01193 1.75148 7.00921 1.74957C7.00645 1.74764 7.00318 1.74658 6.99981 1.74658C6.99644 1.74658 6.99317 1.74764 6.99041 1.74957Z"
                        fill="#111820"
                      />
                    </svg>
                  </div>
                  <Text className={styles.reviewText}>
                    Wonderful - 1,247 reviews {/* Needed a review count */}
                  </Text>
                </div>

                {/* Location section */}
                <Space className={styles["location"]} size={4} align="center">
                  <BuildingsIcon className={styles["location-icon"]} />
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      hotelData.accommodation.location.address.city_name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles["location-link"]}>
                    <Text className={styles["location-text"]}>
                      {countryCode}, {cityName}
                    </Text>
                  </a>
                </Space>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tabs Navigation Section */}
        <div className={styles.tabsHeader}>
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollToSection(tab.key)}
              className={`${styles.tabItem} ${
                activeTab === tab.key ? styles.tabItemActive : ""
              }`}>
              {tab.title}
            </button>
          ))}
        </div>

        {/* Scrollable Content Sections */}
        <div className={styles.contentWrapper}>
          {/* Overview Section */}
          <div id="overview">
            {/* Amenities Section */}
            <HotelAmenities />

            {/* About Section */}
            <div className={styles.about}>
              {/* Check-in/Check-out Information */}
              <div className={styles.aboutItem}>
                <Text className={styles.aboutLabel}>Check-in:</Text>
                <Text className={styles.aboutValue}>
                  {formatTime24To12Hour(checkInTime)}
                </Text>
              </div>
              <div className={styles.aboutItem}>
                <Text className={styles.aboutLabel}>Check-out:</Text>
                <Text className={styles.aboutValue}>
                  {formatTime24To12Hour(checkOutTime)}
                </Text>
              </div>
              <div className={styles.aboutItem}>
                <Text className={styles.aboutLabel}>Cancellation:</Text>
                <Text className={styles.aboutValueGreen}>
                  Free cancellation
                </Text>
              </div>

              {/* About Description */}
              <div className={styles.aboutDescription}>
                <Text className={styles.aboutText}>{hotelDescription}</Text>
              </div>
            </div>
          </div>

          {/* Hotel Rates Loading/Error States */}
          {isLoadingRates && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "10px" }}>
                <Text>Fetching latest hotel rates...</Text>
              </div>
            </div>
          )}

          {ratesError && (
            <Alert
              message="Failed to fetch hotel rates"
              description={ratesError}
              type="error"
              showIcon
              style={{ margin: "20px 0" }}
            />
          )}

          {/* Room Options Section */}
          <div id="room-options">
            <RoomOptions />
          </div>

          <Divider className={styles.divider} />

          {/* Location Section */}
          <div className={styles.locationSection}>
            <Title level={4} className={styles.sectionTitle}>
              Location
            </Title>
            <div className={styles.locationItem}>
              <MapMarkIcon className={styles.mapPinIcon} />
              <Text className={styles.locationAddress}>
                {accommodation.location.address.line_one},{" "}
                {accommodation.location.address.city_name},{" "}
                {accommodation.location.address.postal_code},{" "}
                {accommodation.location.address.country_code}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsPanel;
