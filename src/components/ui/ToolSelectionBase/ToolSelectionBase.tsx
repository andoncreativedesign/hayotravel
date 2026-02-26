import { ArrowRightTailIcon } from "@/components/icons";
import { cn } from "@/utils/helpers/cn";
import { Button, Space, Typography } from "antd";
import { FC } from "react";
import GradientWrapper from "../GradientWrapper/GradientWrapper";
import Status, { StatusType } from "../Status/Status";
import styles from "./ToolSelectionBase.module.scss";

const { Text, Title } = Typography;

export type ToolSelectionBaseProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  status?: StatusType;
  selected?: boolean;
  classNameWrapper?: string;
  classNameFilter?: string;
};

const ToolSelectionBase: FC<ToolSelectionBaseProps> = ({
  title,
  description,
  icon,
  status,
  onClick,
  selected = false,
  classNameWrapper,
  classNameFilter,
}) => {
  return (
    <GradientWrapper
      className={cn(
        classNameWrapper,
        styles.wrapper,
        selected && styles["wrapper--selected"]
      )}>
      <div className={cn(classNameFilter, styles.wrapper__filter)} />
      <div className={styles.content} onClick={onClick}>
        <Space size={12}>
          <div className={styles.content__icon}>{icon}</div>
          <div>
            <Title level={5} className={styles.content__title}>
              {title}
            </Title>
            <Text className={styles.content__description}>{description}</Text>
          </div>
        </Space>
        <div className={styles.content__actions}>
          {status && <Status status={status} />}
          <GradientWrapper className={styles.content__button__wrapper}>
            <Button
              type="default"
              size="large"
              className={styles.content__button}>
              <ArrowRightTailIcon />
            </Button>
          </GradientWrapper>
        </div>
      </div>
    </GradientWrapper>
  );
};

export default ToolSelectionBase;
