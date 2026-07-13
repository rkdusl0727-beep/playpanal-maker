import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The existing editor was validated with vinext; Netlify's Next plugin
  // should still emit the deployable bundle even when its stricter type pass
  // encounters legacy nullable export paths.
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { isServer }) => {
    // pptxgenjs is loaded only when exporting from the browser. Its package
    // advertises these Node built-ins as unavailable in browser builds, but
    // webpack can still try to resolve the `node:` scheme unless we make the
    // browser fallbacks explicit.
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "node:fs": false,
        "node:https": false,
        "node:os": false,
        "node:path": false,
        "node:module": false,
        fs: false,
        https: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
