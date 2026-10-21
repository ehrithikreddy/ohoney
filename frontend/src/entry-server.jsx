// Build-time entry used by scripts/prerender.js to render each route to static HTML.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { products } from '@ohoney/shared/catalog.js'
import App from './App.jsx'
import { SeoCollector } from './seo/seo-context.js'

export const routes = [
  '/',
  '/shop',
  ...products.map((p) => `/shop/${p.slug}`),
  '/about',
  '/wholesale',
  '/contact',
  '/faq',
  '/shipping',
  '/returns',
  '/privacy',
  '/terms',
  '/checkout',
  '/order/confirmed',
  '/404',
]

export function render(url) {
  const meta = {}
  const html = renderToString(
    <StrictMode>
      <SeoCollector.Provider value={meta}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SeoCollector.Provider>
    </StrictMode>,
  )
  return { html, meta }
}

export { headTags } from './seo/head.js'
