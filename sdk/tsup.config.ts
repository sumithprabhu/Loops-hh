// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Your entry point
  format: ["cjs", "esm"], // Produce both CJS and ESM
  dts: {
    entry: "src/index.ts", // Ensure single .d.ts file
    resolve: true, // Resolve types for dual-module compatibility
  },
  splitting: false, // Disable code splitting
  sourcemap: true, // Generate source maps
  clean: true, // Clean dist/ before build to remove old files
  outDir: "dist", // Output directory
});