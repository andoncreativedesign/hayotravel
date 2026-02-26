import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const PencilSimpleSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    {...props}>
    <path
      d="M11.0118 1.98816C11.2634 1.73654 11.6366 1.73654 11.8882 1.98816L14.0118 4.11177C14.2634 4.36339 14.2634 4.73661 14.0118 4.98824L5.44975 13.5503C5.32951 13.6705 5.17221 13.7505 5.00309 13.7798L1.64976 14.3499C1.29939 14.4068 1.00155 14.1089 1.05844 13.7586L1.62851 10.4052C1.65777 10.2361 1.73778 10.0788 1.85802 9.9586L11.0118 1.98816ZM12.5 3.45711L2.56825 12.3429L2.21547 14.2845L4.15703 13.9317L13.5429 4.54289L12.5 3.45711Z"
      fill="currentColor"
    />
  </svg>
);

const PencilSimpleIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PencilSimpleSvg} {...props} />
);

export default PencilSimpleIcon;
