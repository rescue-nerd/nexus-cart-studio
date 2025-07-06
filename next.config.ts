import type {NextConfig} from 'next';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
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
      // Add plugin to handle node: prefixed imports
      config.plugins = [
        ...(config.plugins || []),
        new config.webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource) => {
            resource.request = resource.request.replace(/^node:/, '');
          }
        ),
      ];

      config.externals = [
        ...(config.externals || []),
        'firebase-admin',
        '@google-cloud/storage',
        'google-logging-utils',
        'google-auth-library',
        'gcp-metadata',
      ];

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'node:process': require.resolve('process/browser'),
        'node:stream': require.resolve('stream-browserify'),
        'node:buffer': false,
        'node:util': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:path': false,
        'node:crypto': require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        buffer: false,
        util: false,
        url: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
      };
    }

    return config;
  },
};

export default withPWA(nextConfig);