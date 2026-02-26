import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const ArrowRightBigSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M7.05806 3.30806C7.30214 3.06398 7.69777 3.06398 7.94185 3.30806L14.1918 9.55806C14.4359 9.80213 14.4359 10.1978 14.1918 10.4418L7.94185 16.6918C7.69777 16.9359 7.30214 16.9359 7.05806 16.6918C6.81398 16.4478 6.81398 16.0521 7.05806 15.8081L12.8662 9.99995L7.05806 4.19185C6.81398 3.94777 6.81398 3.55214 7.05806 3.30806Z"
      fill="currentColor"
    />
  </svg>
);
const ArrowRightBigIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ArrowRightBigSvg} {...props} />
);

export default ArrowRightBigIcon;
