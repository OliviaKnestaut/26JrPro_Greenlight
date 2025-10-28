import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // If you deploy the site to a subdirectory (for example
  // https://digmstudents.westphal.drexel.edu/~ojk25/jrProjGreenlight/), set the
  // `base` option so Vite generates asset links with that prefix. Include
  // the `~username` segment if your university server uses that in URLs.
  base: "/~ojk25/jrProjGreenlight/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
