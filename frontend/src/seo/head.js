import { site } from '../content/site.js'

export const DEFAULT_OG_IMAGE = '/og/ohoney.png'

// Staging and client-review deployments set VITE_NOINDEX=true so search engines skip them.
const NOINDEX_ALL = import.meta.env.VITE_NOINDEX === 'true'

/** Normalises page metadata into the full set of values the <head> needs. */
export function resolveMeta({ title, description, path = '/', image, type = 'website', noindex = false, jsonLd = [] }) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name}: ${site.tagline}`
  return {
    title: fullTitle,
    description: description || site.description,
    canonical: `${site.url}${path === '/' ? '/' : path.replace(/\/$/, '')}`,
    image: `${site.url}${image || DEFAULT_OG_IMAGE}`,
    type,
    noindex: noindex || NOINDEX_ALL,
    jsonLd,
  }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// JSON inside <script> must not be able to close the tag.
const safeJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c')

/** HTML for the prerendered <head>. */
export function headTags(m) {
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${esc(m.canonical)}" />`,
    m.noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:type" content="${esc(m.type)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(m.canonical)}" />`,
    `<meta property="og:image" content="${esc(m.image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:locale" content="en_IN" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    ...m.jsonLd.map((d) => `<script type="application/ld+json">${safeJson(d)}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ')
}

/** Updates the live document after client-side navigation. */
export function applyToDocument(m) {
  document.title = m.title
  const set = (selector, attr, value, create) => {
    let el = document.head.querySelector(selector)
    if (!el && value != null) {
      el = create()
      document.head.appendChild(el)
    }
    if (el && value == null) el.remove()
    else if (el) el.setAttribute(attr, value)
  }
  const tag = (name, attr, key) => () => {
    const el = document.createElement(name)
    el.setAttribute(attr, key)
    return el
  }

  set('meta[name="description"]', 'content', m.description, tag('meta', 'name', 'description'))
  set('link[rel="canonical"]', 'href', m.canonical, tag('link', 'rel', 'canonical'))
  set('meta[name="robots"]', 'content', m.noindex ? 'noindex' : null, tag('meta', 'name', 'robots'))
  for (const [prop, value] of [['og:type', m.type], ['og:title', m.title], ['og:description', m.description], ['og:url', m.canonical], ['og:image', m.image]]) {
    set(`meta[property="${prop}"]`, 'content', value, tag('meta', 'property', prop))
  }

  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
  for (const d of m.jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(d)
    document.head.appendChild(s)
  }
}
