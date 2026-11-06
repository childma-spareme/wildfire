# Wildfire Digital Marketing

Static marketing website for Wildfire Digital Marketing.

## Hostinger Deployment

This project is configured as a Vite front-end app so Hostinger can detect a supported framework from GitHub.

- Framework: Vite
- Node version: 20.x
- Build command: `npm run build`
- Output directory: `dist`

The homepage source is `index.html`, with styles in `styles.css` and JavaScript in `script.js`.

Service, area, and organization pages are static files in `public/<slug>/index.html`. Vite copies `public/` into `dist/` unchanged, so those URLs match the live site and the page-specific CSS stays ahead of the shared stylesheet. Images used by those pages are in `public/assets-wf/` and are served from `/assets-wf/`. The pages link the shared stylesheet Vite emits for the homepage (`/assets/index-BD0Uuc0w.css` for the current `styles.css`). `public/sitemap.xml` is copied to `dist/sitemap.xml`.
