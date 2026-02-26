import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const CloseSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M15.1831 3.93306C15.4272 3.68898 15.8228 3.68898 16.0669 3.93306C16.3109 4.17714 16.3109 4.57279 16.0669 4.81685L10.8838 9.99996L16.0669 15.1831L16.1096 15.2307C16.3098 15.4762 16.2957 15.8381 16.0669 16.0669C15.8381 16.2957 15.4762 16.3098 15.2307 16.1096L15.1831 16.0669L9.99996 10.8838L4.81685 16.0669C4.57279 16.3109 4.17714 16.3109 3.93306 16.0669C3.68898 15.8228 3.68898 15.4272 3.93306 15.1831L9.11617 9.99996L3.93306 4.81685C3.68898 4.57277 3.68898 4.17714 3.93306 3.93306C4.17714 3.68898 4.57277 3.68898 4.81685 3.93306L9.99996 9.11617L15.1831 3.93306Z"
      fill="currentColor"
    />
  </svg>
);
const CloseIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CloseSvg} {...props} />
);

export default CloseIcon;
