/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["mui-color-input", "mui-tel-input"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_ENV === 'production' ? "api.crm-s.com" : "new.crm-s.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  // typescript: {
  //   ignoreBuildErrors: true,
  // }
};

export default nextConfig;
