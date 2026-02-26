import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const ReplaySvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <path
      d="M8 1.5C11.5899 1.5 14.5 4.41015 14.5 8C14.5 11.5899 11.5899 14.5 8 14.5C4.41015 14.5 1.5 11.5899 1.5 8C1.5 6.14348 2.26116 4.45420 3.5 3.22653V5.25C3.5 5.66421 3.83579 6 4.25 6C4.66421 6 5 5.66421 5 5.25V2.25C5 1.83579 4.66421 1.5 4.25 1.5H1.25C0.835786 1.5 0.5 1.83579 0.5 2.25C0.5 2.66421 0.835786 3 1.25 3H2.88388C1.19259 4.56591 0.5 6.68013 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C7.58579 0.5 7.25 0.835786 7.25 1.25C7.25 1.66421 7.58579 2 8 2"
      fill="currentColor"
    />
  </svg>
);

const ReplayIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={ReplaySvg} {...props} />
);

export default ReplayIcon; 