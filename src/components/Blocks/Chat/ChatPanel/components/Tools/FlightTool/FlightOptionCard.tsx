import { ShoppingCartIcon } from "@/components/icons";
import PaymentButton from "@/components/ui/PaymentButton/PaymentButton";
import { useItineraryMutations } from "@/hooks/useItineraryMutations";
import { currentChatSelector, useChatStore } from "@/store/chat/chats.store";
import {
  createFlightItinerary,
  ItineraryType,
  useItineraryStore,
} from "@/store/itinerary/itinerary.store";
import { ensureISODateString } from "@/utils";
import { SendItineraryBody } from "@/utils/types/chat";
import { FlightOffer } from "@/utils/types/flight";
import { Alert, Divider, Flex, Typography } from "antd";
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import styles from "./FlightOptionCard.module.scss";
import { Leg } from "./Leg";

const { Text } = Typography;

export const FlightOptionCard = ({
  offer,
  searchPassengers,
}: {
  offer: FlightOffer;
  searchPassengers?: unknown[];
}) => {
  const { choosedFlight, itinerary, passengerCount } = useItineraryStore();
  const params = useParams<{ id: string }>();
  const { chatList } = useChatStore((state) => state);
  const chatId = params.id;
  const currentChat = currentChatSelector(chatList, chatId);

  // Use the enhanced hook with all the logic
  const {
    safeSendItinerary,
    safeUpdateItinerary,
    isMutating,
    messageContextHolder,
  } = useItineraryMutations(chatId, currentChat, {
    offerId: offer.id,
  });

  const { owner, total_amount, slices, id } = offer;

  // Safety checks
  if (!slices || !Array.isArray(slices) || slices.length === 0) {
    console.error("FlightOptionCard: No slices data available", {
      offer,
      slices,
    });
    return (
      <div style={{ padding: "20px", border: "1px solid red", margin: "10px" }}>
        <p>Error: Flight data is incomplete</p>
        <pre>{JSON.stringify(offer, null, 2)}</pre>
      </div>
    );
  }

  const outbound = slices[0];
  const ret = slices[1];

  if (!outbound || !outbound.segments || outbound.segments.length === 0) {
    return (
      <div
        style={{ padding: "20px", border: "1px solid orange", margin: "10px" }}>
        <p>Error: Outbound flight data is incomplete</p>
        <pre>{JSON.stringify(outbound, null, 2)}</pre>
      </div>
    );
  }

  const outbound_cabin_class =
    outbound.segments[0]?.passengers?.[0]?.cabin_class_marketing_name || "";

  const ret_cabin_class =
    ret?.segments?.[0]?.passengers?.[0]?.cabin_class_marketing_name || "";

  const outbound_logo_symbol_url =
    outbound.segments[0]?.operating_carrier?.logo_symbol_url || "";
  const ret_logo_symbol_url =
    ret?.segments?.[0]?.operating_carrier?.logo_symbol_url || "";

  const hasReturnFlight = ret && ret.segments && ret.segments.length > 0;

  const handleAddToItinerary = () => {
    const itineraryId = currentChat?.itinerary_id;
    console.log("currentChat", currentChat);
    console.log("itineraryId", itineraryId);
    if (itineraryId) {
      const updateItineraryBody: Partial<SendItineraryBody> = {
        title: currentChat?.title || "New Trip",
        itinerary_data: {
          travelers_count:
            currentChat?.travelers_count ||
            passengerCount ||
            searchPassengers?.length ||
            1,
          itinerary: [
            ...itinerary.filter((item) => item.type !== ItineraryType.Flight),
            createFlightItinerary(offer, searchPassengers),
          ],
        },
      };
      safeUpdateItinerary({
        itinerary: updateItineraryBody,
        itinerary_id: itineraryId,
      });
    } else {
      const outboundSlice = offer.slices[0];
      const returnSlice = offer.slices[1];

      const startDate =
        currentChat?.travel_start_date ||
        outboundSlice.segments[0].departing_at;

      let endDate = currentChat?.travel_end_date;
      if (!endDate) {
        if (returnSlice) {
          endDate = returnSlice.segments[0].departing_at;
        } else {
          const lastSegment =
            outboundSlice.segments[outboundSlice.segments.length - 1];
          const arrivalDate = new Date(lastSegment.arriving_at);
          arrivalDate.setDate(arrivalDate.getDate() + 1);
          endDate = arrivalDate.toISOString();
        }
      }

      const sendItineraryBody: SendItineraryBody = {
        start_date: ensureISODateString(startDate),
        chat_id: currentChat?.id || 0,
        title: currentChat?.title || "New Trip",
        currency: "USD",
        end_date: ensureISODateString(endDate),
        itinerary_data: {
          travelers_count:
            currentChat?.travelers_count ||
            passengerCount ||
            searchPassengers?.length ||
            1,
          itinerary: [createFlightItinerary(offer, searchPassengers)],
        },
      };
      safeSendItinerary(sendItineraryBody);
    }
  };

  return (
    <div className={styles.card}>
      {messageContextHolder}
      <Text className={styles.card__local}>all times are local</Text>
      <Leg
        label="Outbound"
        slice={outbound}
        airline={owner.name}
        cabin_class={outbound_cabin_class}
        logo_symbol_url={outbound_logo_symbol_url}
      />
      <Divider className={styles.card__divider} />
      {hasReturnFlight && (
        <>
          <Leg
            label="Return"
            slice={ret}
            airline={owner.name}
            cabin_class={ret_cabin_class}
            logo_symbol_url={ret_logo_symbol_url}
          />
          <Divider className={styles.card__divider} />
        </>
      )}
      <div className={styles.card__footer}>
        <Flex align="center" gap={2}>
          <Text strong>${total_amount}</Text>
          <Text type="secondary">/person</Text>
        </Flex>
        <AnimatePresence>
          {choosedFlight === id ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}>
              <Alert message="Added to your trip" type="success" showIcon />
            </motion.div>
          ) : (
            <div>
              <PaymentButton
                type="primary"
                onClick={handleAddToItinerary}
                loading={isMutating}
                disabled={isMutating}>
                <ShoppingCartIcon />
                Add to My Basket
              </PaymentButton>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
