import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const CalendarSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="13"
    viewBox="0 0 12 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M8.25 1.2417C8.45711 1.2417 8.625 1.40959 8.625 1.6167V1.9917H9.75C10.1642 1.9917 10.5 2.32749 10.5 2.7417V10.2417C10.5 10.6559 10.1642 10.9917 9.75 10.9917H2.25C1.83579 10.9917 1.5 10.6559 1.5 10.2417V2.7417C1.5 2.32749 1.83579 1.9917 2.25 1.9917H3.375V1.6167C3.375 1.40959 3.54289 1.2417 3.75 1.2417C3.95711 1.2417 4.125 1.40959 4.125 1.6167V1.9917H7.875V1.6167C7.875 1.40959 8.04289 1.2417 8.25 1.2417ZM2.25 4.9917V10.2417H9.75V4.9917H2.25ZM2.25 4.2417H9.75V2.7417H8.625V3.1167C8.625 3.32381 8.45711 3.4917 8.25 3.4917C8.04289 3.4917 7.875 3.32381 7.875 3.1167V2.7417H4.125V3.1167C4.125 3.32381 3.95711 3.4917 3.75 3.4917C3.54289 3.4917 3.375 3.32381 3.375 3.1167V2.7417H2.25V4.2417Z"
      fill="currentColor"
    />
  </svg>
);
const CalendarIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CalendarSvg} {...props} />
);

export default CalendarIcon;
