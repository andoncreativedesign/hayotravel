import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const BarbellSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M5.5 3C6.05228 3 6.5 3.44772 6.5 4V7.5H9.5V4C9.5 3.44772 9.94771 3 10.5 3H12C12.5523 3 13 3.44772 13 4V4.5H14C14.2652 4.5 14.5195 4.60543 14.707 4.79297C14.8946 4.98051 15 5.23478 15 5.5V7.5H15.5C15.7761 7.5 16 7.72386 16 8C16 8.27614 15.7761 8.5 15.5 8.5H15V10.5C15 10.7652 14.8946 11.0195 14.707 11.207C14.5195 11.3946 14.2652 11.5 14 11.5H13V12C13 12.5523 12.5523 13 12 13H10.5C9.94771 13 9.5 12.5523 9.5 12V8.5H6.5V12C6.5 12.5523 6.05228 13 5.5 13H4C3.44772 13 3 12.5523 3 12V11.5H2C1.73478 11.5 1.48051 11.3946 1.29297 11.207C1.10543 11.0195 1 10.7652 1 10.5V8.5H0.5C0.223858 8.5 0 8.27614 0 8C0 7.72386 0.223858 7.5 0.5 7.5H1V5.5C1 5.23478 1.10543 4.98051 1.29297 4.79297C1.4805 4.60543 1.73478 4.5 2 4.5H3V4C3 3.44772 3.44772 3 4 3H5.5ZM4 12H5.5V4H4V12ZM10.5 12H12V4H10.5V12ZM2 10.5H3V5.5H2V10.5ZM13 10.5H14V5.5H13V10.5Z"
      fill="currentColor"
    />
  </svg>
);

const BarbellIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={BarbellSvg} {...props} />
);

export default BarbellIcon;
