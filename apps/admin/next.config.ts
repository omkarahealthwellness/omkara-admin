import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@omkara/core-schemas', '@omkara/ui-tokens'],
  /* config options here */
};

export default nextConfig;
