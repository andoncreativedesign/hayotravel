import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const ArrowLeftSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    {...props}>
    <path
      d="M12.0581 3.30812C12.3022 3.06404 12.6978 3.06404 12.9419 3.30812C13.1859 3.5522 13.1859 3.94785 12.9419 4.19191L7.13375 10L12.9419 15.8081L12.9846 15.8557C13.1848 16.1012 13.1707 16.4631 12.9419 16.6919C12.7131 16.9207 12.3512 16.9348 12.1057 16.7347L12.0581 16.6919L5.80806 10.4419C5.56398 10.1978 5.56398 9.80221 5.80806 9.55813L12.0581 3.30812Z"
      fill="currentColor"
    />
  </svg>
);
const ArrowLeftIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ArrowLeftSvg} {...props} />
);

export default ArrowLeftIcon;
