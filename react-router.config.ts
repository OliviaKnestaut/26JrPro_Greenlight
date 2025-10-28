import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, set this to `false` for a static SPA build
  ssr: false,
  // If the site is hosted under a sub-path (e.g. /~ojk25/jrProjGreenlight/), set
  // basename so route links and the router know the base URL. Include the
  // ~username segment used by your hosting provider.
  basename: "/~ojk25/jrProjGreenlight",
} satisfies Config;
