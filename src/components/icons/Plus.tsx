import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const PlusSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <g clipPath="url(#clip0_14140_6066)">
      <path
        d="M11.7856 7.42111H9.07129V4.70682C9.07129 4.62825 9.007 4.56397 8.92843 4.56397H8.07129C7.99272 4.56397 7.92843 4.62825 7.92843 4.70682V7.42111H5.21415C5.13557 7.42111 5.07129 7.48539 5.07129 7.56397V8.42111C5.07129 8.49968 5.13557 8.56397 5.21415 8.56397H7.92843V11.2783C7.92843 11.3568 7.99272 11.4211 8.07129 11.4211H8.92843C9.007 11.4211 9.07129 11.3568 9.07129 11.2783V8.56397H11.7856C11.8641 8.56397 11.9284 8.49968 11.9284 8.42111V7.56397C11.9284 7.48539 11.8641 7.42111 11.7856 7.42111Z"
        fill="currentColor"
      />
      <path
        d="M8.5 -0.00830078C4.08214 -0.00830078 0.5 3.57384 0.5 7.9917C0.5 12.4096 4.08214 15.9917 8.5 15.9917C12.9179 15.9917 16.5 12.4096 16.5 7.9917C16.5 3.57384 12.9179 -0.00830078 8.5 -0.00830078ZM8.5 14.6346C4.83214 14.6346 1.85714 11.6596 1.85714 7.9917C1.85714 4.32384 4.83214 1.34884 8.5 1.34884C12.1679 1.34884 15.1429 4.32384 15.1429 7.9917C15.1429 11.6596 12.1679 14.6346 8.5 14.6346Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_14140_6066">
        <rect
          width="16"
          height="16"
          fill="white"
          transform="translate(0.5 -0.00830078)"
        />
      </clipPath>
    </defs>
  </svg>
);
const PlusIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={PlusSvg} {...props} />
);

export default PlusIcon;
