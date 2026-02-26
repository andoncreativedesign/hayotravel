import {
  BuildingsIcon,
  CoffeeIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons";
import ExpandButton from "@/components/ui/ExpandButton";
import Status, { StatusType } from "@/components/ui/Status/Status";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import {
  isItineraryCancelled,
  ItineraryHotel,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { updateItinerary } from "@/utils/api/itinerary";
import { formatCurrencyWithSymbol } from "@/utils/helpers/currency";
import { LoadingOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Spin, Typography } from "antd";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import styles from "./ItineraryHotelItem.module.scss";
import { DeleteModal } from "./Modals";

const { Text } = Typography;

interface ItineraryHotelItemProps {
  item: ItineraryHotel;
}

const ItineraryHotelItem = ({ item }: ItineraryHotelItemProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {
    removeItineraryItem,
    toggleItemExpanded,
    itinerary,
    isItineraryPaid,
  } = useItineraryStore();
  const isPaid = isItineraryPaid();
  const { chatList } = useChatStore();
  const params = useParams<{ id: string }>();
  const chatId = params.id;
  const currentChat = currentChatSelector(chatList, chatId);
  const travelersCount = currentChat?.travelers_count;
  const currency = item?.tax_currency || "USD";

  // Mutation to persist itinerary changes to the database
  const { mutate: updateItineraryMutation, isPending: isUpdatingItinerary } =
    useMutation({
      mutationFn: updateItinerary,
      onSuccess: (data) => {
        removeItineraryItem(item.id);
        console.log(
          "Itinerary updated successfully after hotel deletion:",
          data
        );
      },
      onError: (error) => {
        setIsDeleteModalOpen(false);
        console.error("Error updating itinerary after hotel deletion:", error);
        // TODO: Add user-friendly error handling (toast notification, etc.)
      },
    });

  const handleRemove = () => {
    // Persist the changes to the database
    const itineraryId = currentChat?.itinerary_id;
    if (itineraryId) {
      // Create updated itinerary without the deleted item
      const updatedItinerary = itinerary.filter(
        (itineraryItem) => itineraryItem.id !== item.id
      );

      updateItineraryMutation({
        itinerary_id: itineraryId,
        itinerary: {
          itinerary_data: {
            travelers_count: travelersCount || 1,
            itinerary: updatedItinerary,
          },
        },
      });
    }
  };

  const handleToggleExpanded = () => {
    toggleItemExpanded(item.id);
  };

  const formatCheckInTime = () => {
    const checkInDate = new Date(item.data.checkIn);
    return checkInDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatCheckOutTime = () => {
    const checkOutDate = new Date(item.data.checkOut);
    return checkOutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const isCancelled = isItineraryCancelled(item);

  return (
    <div
      className={`${styles.basketItem} ${isCancelled ? styles.cancelled : ""}`}
      data-testid={`itinerary-item-${item.id}`}>
      {/* Top Section */}
      <div className={styles.top}>
        <div className={styles.left}>
          <div className={styles.title}>
            <BuildingsIcon className={styles.icon} />
            <Text className={styles.label}>Accommodation</Text>
          </div>
        </div>
        <div className={styles.right}>
          {isItineraryCancelled(item) ? (
            <Status status={StatusType.Cancelled} />
          ) : isPaid ? (
            <Status status={StatusType.Confirmed} />
          ) : item.isSelected ? (
            <Status status={StatusType.Selected} />
          ) : null}
          <div className={styles.actions}>
            <Button
              type="text"
              className={styles.iconWithBg}
              onClick={() => setIsDeleteModalOpen(true)}
              shape="circle"
              disabled={isUpdatingItinerary || isPaid}>
              {isUpdatingItinerary ? (
                <Spin
                  spinning={isUpdatingItinerary}
                  indicator={<LoadingOutlined spin />}
                />
              ) : (
                <TrashIcon className={styles.actionIcon} />
              )}
            </Button>
            <ExpandButton
              isExpanded={Boolean(item.isExpanded)}
              onToggle={handleToggleExpanded}
              ariaLabel={{
                expanded: "Collapse passenger details",
                collapsed: "Expand passenger details",
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <Text className={styles.dates}>
          {formatCheckInTime()} - {formatCheckOutTime()}
        </Text>
        <div className={styles.description}>
          <Text className={styles.hotelName}>{item.data.name}</Text>
        </div>
      </div>

      {/* Expanded Details */}
      {item.isExpanded && (
        <div className={styles.moreHotelDetails}>
          <div className={styles.hotelCard}>
            <div className={styles.hotelImage}>
              {item.data.photos.length > 0 && (
                <Image
                  src={item.data.photos[0]}
                  alt={item.data.name}
                  className={styles.imageElement}
                  width={150}
                  height={120}
                />
              )}
            </div>
            <div className={styles.hotelContent}>
              <div className={styles.roomHeader}>
                <Text className={styles.roomTitle}>{item.data.room.name}</Text>
                <div className={styles.roomFeatures}>
                  <Text className={styles.featureText}>TDA</Text>
                </div>
              </div>

              <div className={styles.checkInOutRow}>
                <div className={styles.checkInfo}>
                  <Text className={styles.checkLabel}>Check in</Text>
                  <Text className={styles.checkTime}>
                    {formatCheckInTime()}
                  </Text>
                </div>
                <div className={styles.checkInfo}>
                  <Text className={styles.checkLabel}>Check out</Text>
                  <Text className={styles.checkTime}>
                    {formatCheckOutTime()}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.roomInfo}>
            <div className={styles.roomInfoItem}>
              <XIcon className={styles.roomInfoIcon} />
              <Text className={styles.roomInfoText}>
                {item.data.rate.cancellationPolicy.includes("Non-refundable")
                  ? "Non-refundable"
                  : "Free cancellation"}
              </Text>
            </div>
            {item.data.rate.breakfastIncluded && (
              <div className={styles.roomInfoItem}>
                <CoffeeIcon className={styles.roomInfoIcon} />
                <Text className={styles.roomInfoText}>Breakfast included</Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className={styles.divider} />

      {/* Price Section */}
      <div className={styles.price}>
        <div className={styles.priceAmountAll}>
          <Text className={styles.amountAll}>
            Total{" "}
            {formatCurrencyWithSymbol(
              Number(item.price) * (travelersCount || 1),
              currency
            )}
          </Text>
          <Text className={styles.taxesLabel} type="secondary">
            *Taxes included
          </Text>
        </div>
        <div className={styles.priceAmount}>
          <Text className={styles.amount}>
            {formatCurrencyWithSymbol(
              parseFloat(item.price) / item.data.nights,
              currency
            )}
          </Text>
          <Text className={styles.per}>/night</Text>
        </div>
      </div>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={isUpdatingItinerary}
        onConfirm={handleRemove}
        itemType="Hotel"
        tripName={currentChat?.title || "New Trip"}
      />
    </div>
  );
};

export default ItineraryHotelItem;
