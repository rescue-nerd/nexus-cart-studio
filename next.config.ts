import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add fallbacks for Node.js built-in modules in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        'node:stream': require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'),
        'node:process': require.resolve('process/browser'),
      };
    }

    return config;
  },
};

export default withPWA(nextConfig);