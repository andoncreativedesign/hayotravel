import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const XSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M9.10985 2.35984C9.2563 2.21339 9.49367 2.21339 9.64012 2.35984C9.78654 2.50628 9.78656 2.74367 9.64012 2.89011L6.53025 5.99998L9.64012 9.10985L9.66576 9.13841C9.78586 9.2857 9.77741 9.50284 9.64012 9.64012C9.50284 9.77741 9.2857 9.78586 9.13841 9.66576L9.10985 9.64012L5.99998 6.53025L2.89011 9.64012C2.74367 9.78656 2.50628 9.78654 2.35984 9.64012C2.21339 9.49367 2.21339 9.2563 2.35984 9.10985L5.4697 5.99998L2.35984 2.89011C2.21339 2.74366 2.21339 2.50628 2.35984 2.35984C2.50628 2.21339 2.74366 2.21339 2.89011 2.35984L5.99998 5.4697L9.10985 2.35984Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={XSvg} {...props} />
);

export default XIcon;
