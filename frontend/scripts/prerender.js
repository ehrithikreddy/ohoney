// Renders every route to static HTML after `vite build`, so pages load with
// content and per-page <head> tags before any JavaScript runs. Also writes
// sitemap.xml and robots.txt. Run via `npm run build`.

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const ssrEntry = pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href

const { render, routes, headTags } = await import(ssrEntry)
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8')

// Preload the two Latin font files every page uses, so text renders in the right face sooner.
const assets = await fs.readdir(path.join(dist, 'assets'))
const fontPreloads = assets
  .filter((f) => /^(fraunces-latin-soft-normal|anek-latin-latin-wght-normal)-.+\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
if (fontPreloads.length !== 2) throw new Error(`Expected 2 font files to preload, found ${fontPreloads.length}`)

const sitemapUrls = []
let siteUrl = ''

for (const url of routes) {
  const { html, meta } = render(url)
  if (!meta.title) throw new Error(`Route ${url} rendered without <Seo>`)
  siteUrl ||= new URL(meta.canonical).origin

  const page = template
    .replace('<!--app-head-->', [headTags(meta), ...fontPreloads].join('\n    '))
    .replace('<!--app-html-->', html)

  const file = url === '/' ? 'index.html' : url === '/404' ? '404.html' : path.join(url.slice(1), 'index.html')
  await fs.mkdir(path.dirname(path.join(dist, file)), { recursive: true })
  await fs.writeFile(path.join(dist, file), page)
  if (!meta.noindex) sitemapUrls.push(meta.canonical)
}

const noindexAll = process.env.VITE_NOINDEX === 'true'

await fs.writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`,
)

await fs.writeFile(
  path.join(dist, 'robots.txt'),
  noindexAll
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nDisallow: /checkout\nDisallow: /order/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
)

await fs.rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`Prerendered ${routes.length} routes; sitemap has ${sitemapUrls.length} URLs${noindexAll ? ' (noindex build)' : ''}.`)
