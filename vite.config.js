import { copyFileSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
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

      // /assets/site.css and /nav.js keep fixed URLs and Hostinger serves them
      // with a 7-day max-age, so returning visitors kept old copies on inner
      // pages. Stamp every page's reference with a content hash per build.
      const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
      const cssV = hash(resolve(dir, "site.css"));
      const navV = hash(resolve("dist/nav.js"));
      const walk = (d) => readdirSync(d).flatMap((f) => {
        const p = resolve(d, f);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
      });
      for (const page of walk(resolve("dist"))) {
        const html = readFileSync(page, "utf8");
        const out = html
          .replace(/(["'])\/assets\/site\.css(\?v=[^"']*)?\1/g, `$1/assets/site.css?v=${cssV}$1`)
          .replace(/(["'])\/nav\.js(\?v=[^"']*)?\1/g, `$1/nav.js?v=${navV}$1`);
        if (out !== html) writeFileSync(page, out);
      }
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
