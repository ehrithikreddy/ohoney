# ohoney storefront

React 19 + Vite + React Router. Plain CSS with design tokens (`src/styles/tokens.css`). See `../docs/DESIGN_SYSTEM.md`.

- `npm run dev`: development server on :5173. It proxies `/api` to the backend on :8787.
- `npm run build`: client build, SSR build of `src/entry-server.jsx`, then `scripts/prerender.js`. The prerender step writes static HTML for every route, plus `sitemap.xml` and `robots.txt`, into `dist/`.
- `npm test`: unit tests for the cart (Node test runner).
- `npm run lint`: ESLint.

| Where | What |
|---|---|
| `src/content/` | Business details, FAQ and policy text. The client edits these. |
| `../shared/catalog.js` | Products and prices, shared with the API |
| `src/seo/` | Per-page metadata (`<Seo>`), structured data, and the head tags written by the prerender step |
| `public/og/` | Social preview images. Regenerate from `scripts/og-template.html`. |
