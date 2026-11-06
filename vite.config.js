import { copyFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// The service pages in public/ are copied through unchanged, so they cannot
// follow Vite's hashed stylesheet name. Copy the homepage CSS to a stable URL.
function stableSharedCss() {
  return {
    name: "stable-shared-css",
    apply: "build",
    closeBundle() {
      const dir = resolve("dist/assets");
      const css = readdirSync(dir).filter((file) => /^index-.*\.css$/.test(file));
      if (css.length !== 1) {
        throw new Error(`Expected one homepage stylesheet, found ${css.join(", ") || "none"}`);
      }
      copyFileSync(resolve(dir, css[0]), resolve(dir, "site.css"));
    }
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [stableSharedCss()],
  build: {
    outDir: "dist"
  }
});
