import { cn } from "@/utils/helpers/cn";
import { Badge, Tooltip } from "antd";
import styles from "./Status.module.scss";

export enum StatusType {
  Selected = "selected",
  Pending = "pending",
  Confirmed = "confirmed",
  Failed = "failed",
  Cancelled = "cancelled",
}

export const statusInfo = {
  [StatusType.Selected]: {
    text: "Selected",
    tooltipText: "Not booked yet. Can be edited.",
  },
  [StatusType.Pending]: {
    text: "Pending...",
    tooltipText:
      "Processing payment or checking availability. If it takes longer then 20 min contact support",
  },
  [StatusType.Confirmed]: {
    text: "Confirmed",
    tooltipText: "Successfully booked and confirmed. Ready for your trip!",
  },
  [StatusType.Failed]: {
    text: "Failed",
    tooltipText: "green",
  },
  [StatusType.Cancelled]: {
    text: "Cancelled",
    tooltipText: "Booking cancelled.",
  },
};

type StatusProps = {
  status: StatusType;
};

const Status = ({ status }: StatusProps) => {
  return (
    <Tooltip title={statusInfo[status].tooltipText}>
      <Badge
        className={cn(
          styles.status,
          {
            [StatusType.Selected]: styles.status__selected,
            [StatusType.Pending]: styles.status__pending,
            [StatusType.Confirmed]: styles.status__confirmed,
            [StatusType.Failed]: styles.status__failed,
            [StatusType.Cancelled]: styles.status__cancelled,
          }[status]
        )}>
        {statusInfo[status].text}
      </Badge>
    </Tooltip>
  );
};

export default Status;
