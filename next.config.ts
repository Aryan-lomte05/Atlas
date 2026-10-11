import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next writes AGENTS.md on every dev boot, which dirties the tree and
  // reintroduces dash characters the project forbids.
  agentRules: false,

  // Tailwind v4 is compiled through the Turbopack loader rather than a
  // PostCSS config. Removing this silently disables every utility class.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
