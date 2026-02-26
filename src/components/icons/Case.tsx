import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const CaseSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M10 2C10.3978 2 10.7792 2.15815 11.0605 2.43945C11.3419 2.72076 11.5 3.10218 11.5 3.5V4H14C14.5523 4 15 4.44772 15 5V13C15 13.5523 14.5523 14 14 14H3C2.44772 14 2 13.5523 2 13V5C2 4.44772 2.44772 4 3 4H5.5V3.5C5.5 3.10218 5.65815 2.72076 5.93945 2.43945C6.22076 2.15815 6.60218 2 7 2H10ZM3 10.5V13H14V10.5H3ZM3 9.5H14V5H3V9.5ZM7 3C6.86739 3 6.74025 3.05272 6.64648 3.14648C6.55272 3.24025 6.5 3.36739 6.5 3.5V4H10.5V3.5C10.5 3.36739 10.4473 3.24025 10.3535 3.14648C10.2597 3.05272 10.1326 3 10 3H7Z"
      fill="currentColor"
    />
  </svg>
);
const CaseIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CaseSvg} {...props} />
);

export default CaseIcon;
