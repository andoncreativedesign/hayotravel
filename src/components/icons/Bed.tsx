import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const BedSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M1 2.5C1.27614 2.5 1.5 2.72386 1.5 3V4.5H13C13.663 4.5 14.2987 4.76358 14.7676 5.23242C15.2364 5.70126 15.5 6.33696 15.5 7V13C15.5 13.2761 15.2761 13.5 15 13.5C14.7239 13.5 14.5 13.2761 14.5 13V11H1.5V13C1.5 13.2761 1.27614 13.5 1 13.5C0.723858 13.5 0.5 13.2761 0.5 13V3C0.5 2.72386 0.723858 2.5 1 2.5ZM1.5 5.5V10H6V5.5H1.5ZM7 10H14.5V7C14.5 6.60218 14.3419 6.22076 14.0605 5.93945C13.7792 5.65815 13.3978 5.5 13 5.5H7V10Z"
      fill="currentColor"
    />
  </svg>
);

const BedIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BedSvg} {...props} />
);

export default BedIcon;
