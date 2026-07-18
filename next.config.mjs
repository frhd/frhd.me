import { execSync } from 'node:child_process';

// Resolved once at build time and exposed as NEXT_PUBLIC_COMMIT (read by
// lib/buildinfo.ts) for the editor chrome's footer. Falls back to 'dev' so a
// missing git binary/history (some CI or deploy environments) never breaks
// the build.
function commitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_COMMIT: commitHash()
  }
};

export default nextConfig;
