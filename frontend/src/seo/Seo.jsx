import { useContext, useEffect } from 'react'
import { SeoCollector } from './seo-context.js'
import { applyToDocument, resolveMeta } from './head.js'

/** Declares a page's title, description, canonical path and structured data. */
export default function Seo(props) {
  const collector = useContext(SeoCollector)
  const meta = resolveMeta(props)
  // Prerender: record the meta for the HTML template (render-time, server only).
  if (collector) Object.assign(collector, meta)

  const key = JSON.stringify(meta)
  useEffect(() => {
    applyToDocument(JSON.parse(key))
  }, [key])

  return null
}
