import { cn } from "@/utils/helpers/cn";
import styles from "./GradientWrapper.module.scss";

interface GradientWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const GradientWrapper = ({ children, className }: GradientWrapperProps) => {
  return <div className={cn(styles.wrapper, className)}>{children}</div>;
};

export default GradientWrapper;
