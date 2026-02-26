import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

const LogoMiniSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={34}
    height={34}
    fill="none"
    {...props}>
    <path
      fill="url(#a)"
      d="m5.85 22.764 1.296 1.298 1.298-1.298-1.298-1.297-1.297 1.297Z"
    />
    <path
      fill="url(#b)"
      d="m8.572 22.765 1.297 1.297 1.297-1.297-1.297-1.297-1.297 1.297Z"
    />
    <path
      fill="url(#c)"
      d="M26.597 16.486a.516.516 0 0 0-.196.094c-.384.316-.757.643-1.135.966a.75.75 0 0 1-.583.201c.362-.416.705-.847 1.077-1.277-11.489-.024-13.34 8.547-13.34 8.547 1.015-3.382 5.031-5.042 5.031-5.042 3.878-1.765 10.672-.591 10.672-.591l1.385-2.633a28.028 28.028 0 0 0-2.91-.264v-.001Z"
    />
    <path
      fill="url(#d)"
      d="M6.754 15.27a8.602 8.602 0 0 1-1.055 2.274c.46.28.865.532 1.234.73 3.6 2.216 5.359-3.494 5.359-3.494-1.83 3.158-4.399 1.117-5.538.49Z"
    />
    <path
      fill="url(#e)"
      d="M19.263 14.712a29.519 29.519 0 0 0 2.94 1.661 19.182 19.182 0 0 1 3.624-.355c-.248-.435-.452-.772-.68-1.174.264.014.36.059.53.241.259.279.512.564.779.835.049.05.127.09.2.106.96.026 1.98.108 3.07.26l.553-1.015c-6.21-.609-9.377-3.244-11.515-4.393-4.428-2.724-6.588 4.295-6.588 4.295 2.414-4.165 5.874-.971 7.086-.463l.001.002Z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={3.989}
        x2={19.369}
        y1={21.407}
        y2={28.019}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF5601" />
        <stop offset={0.28} stopColor="#D53B22" />
        <stop offset={0.77} stopColor="#931058" />
        <stop offset={1} stopColor="#79006E" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={4.416}
        x2={19.795}
        y1={20.421}
        y2={27.033}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF5601" />
        <stop offset={0.28} stopColor="#D53B22" />
        <stop offset={0.77} stopColor="#931058" />
        <stop offset={1} stopColor="#79006E" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={6.829}
        x2={22.208}
        y1={14.807}
        y2={21.419}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF5601" />
        <stop offset={0.28} stopColor="#D53B22" />
        <stop offset={0.77} stopColor="#931058" />
        <stop offset={1} stopColor="#79006E" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={6.628}
        x2={22.008}
        y1={15.27}
        y2={21.881}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF5601" />
        <stop offset={0.21} stopColor="#D53B22" />
        <stop offset={0.57} stopColor="#931058" />
        <stop offset={0.74} stopColor="#79006E" />
      </linearGradient>
      <linearGradient
        id="e"
        x1={8.923}
        x2={24.302}
        y1={9.933}
        y2={16.545}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF5601" />
        <stop offset={0.28} stopColor="#D53B22" />
        <stop offset={0.77} stopColor="#931058" />
        <stop offset={1} stopColor="#79006E" />
      </linearGradient>
    </defs>
  </svg>
);
const LogoMiniIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={LogoMiniSvg} {...props} />
);

export default LogoMiniIcon;
