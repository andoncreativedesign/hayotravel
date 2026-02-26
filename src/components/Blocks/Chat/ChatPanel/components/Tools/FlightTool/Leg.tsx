import { parseDuration } from "@/utils";
import { cn } from "@/utils/helpers/cn";
import { capitalizeFirstLetter } from "@/utils/helpers/firstLetterUpercase";
import { formatDayWithDate, formatTime12Hour, getYear } from "@/utils/helpers/transformDates";
import { OfferSlice } from "@/utils/types/flight";
import { Badge, Divider, Flex, Typography } from "antd";
import Image from "next/image";
import styles from "./Leg.module.scss";

const { Title, Text } = Typography;

interface LegProps {
  label: string;
  slice: OfferSlice;
  airline: string;
  cabin_class: string;
  logo_symbol_url: string;
}

export const Leg = ({
  label,
  slice,
  airline,
  cabin_class,
  logo_symbol_url,
}: LegProps) => {
  const departureSegment = slice.segments[0];
  const arrivalSegment = slice.segments[slice.segments.length - 1];
  const stops = slice.segments.length - 1;
  const departureTime = formatTime12Hour(
    new Date(departureSegment.departing_at)
  );
  const arrivalTime = formatTime12Hour(new Date(arrivalSegment.arriving_at));

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between">
        <Flex gap={8} align="center">
          <Title level={5} className={styles.lag__label}>
            {label}
          </Title>
          <Text type="secondary" className={styles.lag__date}>
            {formatDayWithDate(new Date(departureSegment.departing_at))}, {getYear(new Date(departureSegment.departing_at))}
          </Text>
        </Flex>
      </Flex>

      <Flex justify="space-between">
        <Flex gap={8}>
          <Image src={logo_symbol_url} alt={airline} width={30} height={17} />
          <Flex vertical gap={4}>
            <Title level={4} className={styles.lag__label}>
              {airline}
            </Title>
            <Flex align="center" gap={10}>
              <Text className={styles.lag__plaine_number}>
                {departureSegment.operating_carrier_flight_number}
              </Text>
              <Badge className={styles.lag__badge}>
                {capitalizeFirstLetter(cabin_class)}
              </Badge>
            </Flex>
          </Flex>
        </Flex>

        <Flex gap={16}>
          <Flex vertical gap={4}>
            <Text className={styles.lag__time}>{departureTime}</Text>
            <Text className={styles.lag__from}>
              {departureSegment.origin.iata_code}
            </Text>
          </Flex>
          <Flex vertical align="center" className={styles.lag__duration}>
            <Text className={styles.lag__duration__text}>
              {parseDuration(slice.duration)}
            </Text>
            <Divider className={styles.lag__divider} dashed />
            <Text
              className={cn(
                styles.lag__duration__text,
                styles.lag__duration__text__stops
              )}>
              {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
            </Text>
          </Flex>
          <Flex vertical gap={4}>
            <Text className={styles.lag__time}>{arrivalTime}</Text>
            <Text className={styles.lag__from}>
              {arrivalSegment.destination.iata_code}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
