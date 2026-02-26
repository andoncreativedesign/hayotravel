import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "q-xx.bstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pix8.agoda.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mobileimg.priceline.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.duffel.com",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
