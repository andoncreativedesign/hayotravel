"use client";
import { WorkZone } from "@/components/Blocks/WorkZone";
import { AuthProvider } from "@/providers/Auth.provider";
import QueryProviders from "@/providers/Query.provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";
import { App, ConfigProvider } from "antd";
import { Geist } from "next/font/google";
import Image from "next/image";
import "./fonts.scss";
import "./globals.scss";

const geist = Geist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className}>
      <head>
        <title>Hayo - Travel Concierge</title>
        <meta
          name="description"
          content="Travel booking, handled like a concierge would."
        />
      </head>
      <body className={`antialiased`} suppressHydrationWarning={true}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              cssVar: true,
              token: {
                fontFamily: "var(--font-nexa)",

                colorPrimary: "var(--colorPrimary)", // Default / Focus
                colorPrimaryHover: "var(--colorPrimaryHover)", // Hover
                colorPrimaryActive: "var(--colorPrimaryActive)", // Pressed

                colorBgContainer: "var(--colorBgContainer)", // Default BG
                colorBgContainerDisabled: "var(--colorBgContainerDisabled)", // Disabled BG
                colorText: "var(--colorText)", // Default text
                colorTextDisabled: "var(--colorTextDisabled)", // Disabled text

                colorBorder: "var(--colorBorder)", // Default border

                colorTextBase: "var(--colorText)",
                colorTextDescription: "var(--colorTextDescription)",
                colorTextSecondary: "var(--colorTextDescription)",
              },
              components: {
                Layout: {
                  siderBg: "var(--colorBgContainer)",
                },
                Avatar: {
                  colorBgContainer: "var(--colorBgContainer)",
                },
                Segmented: {
                  itemActiveBg: "var(--colorText)",
                  itemColor: "var(--colorText)",
                  itemHoverBg: "var(--colorBgSpotlight)",
                  itemHoverColor: "var(--colorTextSolid)",
                  itemSelectedBg: "var(--colorText)",
                  itemSelectedColor: "var(--colorTextSolid)",
                  trackPadding: 2,
                },
                Typography: {
                  titleMarginTop: 0,
                  titleMarginBottom: 0,
                  margin: 0,
                },
                Rate: {
                  starSize: 14,
                },
                Steps: {
                  // Icon sizes and positioning
                  iconSize: 32,
                  iconSizeSM: 28,
                  iconFontSize: 14,
                  iconTop: 0,

                  // Custom icon settings
                  customIconSize: 32,
                  customIconFontSize: 14,
                  customIconTop: 0,

                  // Title styling
                  titleLineHeight: 1.5,

                  // Description settings
                  descriptionMaxWidth: 200,

                  // Colors will be handled by CSS variables and custom styles
                },
                Input: {
                  // Font size for all input sizes
                  inputFontSize: 14,
                  inputFontSizeLG: 14,
                  inputFontSizeSM: 14,
                  // Padding for all input sizes - 32px height with 10px vertical padding
                  paddingBlock: 10,
                  paddingBlockLG: 10,
                  paddingBlockSM: 10,
                  // Horizontal padding - 12px as per design
                  paddingInline: 12,
                  paddingInlineLG: 12,
                  paddingInlineSM: 12,
                  // Border radius
                  borderRadius: 8,
                },
                Select: {
                  // Font size
                  fontSize: 14,
                  fontSizeLG: 14,
                  fontSizeSM: 14,
                  // Control height to match input
                  controlHeight: 32,
                  controlHeightLG: 32,
                  controlHeightSM: 32,
                  // Padding
                  paddingXS: 12,
                  paddingXXS: 10,
                  // Border radius
                  borderRadius: 8,
                },
                DatePicker: {
                  // Font size
                  fontSize: 14,
                  fontSizeLG: 14,
                  fontSizeSM: 14,
                  // Control height
                  controlHeight: 32,
                  controlHeightLG: 32,
                  controlHeightSM: 32,
                  // Padding - horizontal 12px, vertical calculated to achieve 32px height
                  paddingInline: 12,
                  // Border radius
                  borderRadius: 8,
                },
                InputNumber: {
                  // Font size
                  fontSize: 14,
                  fontSizeLG: 14,
                  fontSizeSM: 14,
                  // Control height
                  controlHeight: 32,
                  controlHeightLG: 32,
                  controlHeightSM: 32,
                  // Padding
                  paddingInline: 12,
                  // Border radius
                  borderRadius: 8,
                },
                Cascader: {
                  // Font size
                  fontSize: 14,
                  fontSizeLG: 14,
                  fontSizeSM: 14,
                  // Control height
                  controlHeight: 32,
                  controlHeightLG: 32,
                  controlHeightSM: 32,
                  // Border radius
                  borderRadius: 8,
                },
                Checkbox: {
                  // Border radius for checkbox
                  borderRadiusOuter: 4,
                  // Size
                  size: 16,
                  // Colors - using the primary color from design
                  colorPrimary: "var(--colorPrimary)", // #ff5601
                  colorPrimaryHover: "var(--colorPrimaryHover)",
                  colorPrimaryActive: "var(--colorPrimaryActive)",
                  // Border color
                  colorBorder: "var(--colorBorder)",
                  // Text color
                  colorText: "var(--colorText)",
                },
              },
            }}>
            <App>
              <Image
                src="/bg.png"
                alt="bg"
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  zIndex: -1,
                  width: "100vw",
                  height: "100vh",
                }}
                width={1440}
                height={960}
              />
              <AuthProvider>
                <QueryProviders>
                  <WorkZone>{children}</WorkZone>
                </QueryProviders>
              </AuthProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
