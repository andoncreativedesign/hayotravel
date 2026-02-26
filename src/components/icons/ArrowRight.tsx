import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const ArrowRightSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}>
    <path
      d="M7.05806 3.30812C7.30214 3.06404 7.69777 3.06404 7.94185 3.30812L14.1918 9.55812C14.4359 9.8022 14.4359 10.1978 14.1918 10.4419L7.94185 16.6919C7.69777 16.936 7.30214 16.936 7.05806 16.6919C6.81398 16.4478 6.81398 16.0522 7.05806 15.8081L12.8662 10L7.05806 4.19191C6.81398 3.94783 6.81398 3.5522 7.05806 3.30812Z"
      fill="currentColor"
    />
  </svg>
);
const ArrowRightIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ArrowRightSvg} {...props} />
);

export default ArrowRightIcon;
