# Wildfire Digital Marketing

Static marketing website for Wildfire Digital Marketing.

## Hostinger Deployment

This project is configured as a Vite front-end app so Hostinger can detect a supported framework from GitHub.

- Framework: Vite
- Node version: 20.x
- Build command: `npm run build`
- Output directory: `dist`

The homepage source is `index.html`, with styles in `styles.css`. Shared navigation behavior is in `public/nav.js`.

Service, area, and organization pages are static files in `public/<slug>/index.html`. Vite copies `public/` into `dist/` unchanged, so those URLs match the live site and each page's own `<style>` block stays ahead of the shared stylesheet. Images used by those pages are in `public/assets-wf/` and are served from `/assets-wf/`. The build also copies the homepage stylesheet to `dist/assets/site.css`, which is the URL those pages use. `public/sitemap.xml` is copied to `dist/sitemap.xml`.

The same header menu is in the homepage and every service page. Its behavior is in `public/nav.js`.
