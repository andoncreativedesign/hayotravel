/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlightOffer } from "@/utils/types/flight";
import { Carousel } from "antd";
import React from "react";
import { FlightOptionCard } from "./FlightOptionCard";
import styles from "./FlightTool.module.scss";

interface Props {
  options: FlightOffer[];
  onSlideChange?: (current: number) => void;
}

interface CustomArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  direction: "prev" | "next";
}

const CustomArrow: React.FC<CustomArrowProps> = ({
  className,
  style,
  onClick,
  direction,
}) => {
  return (
    <button
      className={`${styles[`carousel__arrow--${direction}`]} ${
        className || ""
      }`}
      style={style}
      onClick={onClick}
      type="button"></button>
  );
};

export const FlightTool: React.FC<Props> = ({ options, onSlideChange }) => {
  // Extract passengers data if it was attached to the options array
  const searchPassengers = (options as any).searchPassengers || [];
  console.log("FlightTool received search passengers:", searchPassengers);

  return (
    <div className={styles.container}>
      <Carousel
        dots={{ className: styles.carousel__dots }}
        infinite={false}
        slidesToShow={1}
        slidesToScroll={1}
        adaptiveHeight
        waitForAnimate
        arrows
        afterChange={onSlideChange}
        nextArrow={<CustomArrow direction="next" />}
        prevArrow={<CustomArrow direction="prev" />}>
        {options.map((option) => (
          <div key={option.id} className={styles.carousel__slide}>
            <FlightOptionCard
              offer={option}
              searchPassengers={searchPassengers}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
