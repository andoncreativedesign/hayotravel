import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const CopySvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}>
    <path
      d="M13.5 2C13.7761 2 14 2.22386 14 2.5V10.5C14 10.7761 13.7761 11 13.5 11H11V13.5C11 13.7761 10.7761 14 10.5 14H2.5C2.22386 14 2 13.7761 2 13.5V5.5C2 5.22386 2.22386 5 2.5 5H5V2.5C5 2.22386 5.22386 2 5.5 2H13.5ZM3 13H10V6H3V13ZM6 5H10.5C10.7761 5 11 5.22386 11 5.5V10H13V3H6V5Z"
      fill="currentColor"
    />
  </svg>
);

const CopyIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CopySvg} {...props} />
);

export default CopyIcon;
