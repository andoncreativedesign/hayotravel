import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const CaretDownSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M12.6465 5.65475C12.8417 5.45949 13.1582 5.45949 13.3535 5.65475C13.5487 5.85001 13.5487 6.16653 13.3535 6.36178L8.35349 11.3618C8.15824 11.557 7.84172 11.557 7.64646 11.3618L2.64645 6.36178C2.45118 6.16652 2.45118 5.85001 2.64645 5.65475C2.84171 5.45949 3.15822 5.45949 3.35348 5.65475L7.99997 10.3012L12.6465 5.65475Z"
      fill="currentColor"
    />
  </svg>
);
const CaretDownIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CaretDownSvg} {...props} />
);

export default CaretDownIcon;
