import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  // Nested git worktrees and build output are not part of this tree's sources
  // (mirrors the vitest exclude in vitest.config.ts).
  { ignores: [".worktrees/**", "out/**"] },
  ...nextConfig,
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
