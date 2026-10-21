import { createContext } from 'react'

// On the server (prerender) this holds an object that <Seo> fills in for the page
// being rendered. In the browser it is null and <Seo> updates document.head instead.
export const SeoCollector = createContext(null)
