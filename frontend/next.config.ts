import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      net: false,
      tls: false,
      http: false,
      https: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;


