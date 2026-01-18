/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false, // Disable worker threads to avoid resource issues
  },
};

export default nextConfig;
