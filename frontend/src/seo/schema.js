// schema.org data. Only facts the site states elsewhere: no ratings, reviews or claims.
import { site } from '../content/site.js'

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: `${site.url}/`,
  logo: `${site.url}/android-chrome-512x512.png`,
  email: site.email,
  telephone: site.phoneDisplay.replace(/\s/g, ''),
  address: { '@type': 'PostalAddress', addressLocality: 'Hyderabad', addressRegion: 'Telangana', addressCountry: 'IN' },
})

export const productSchema = (product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${product.name} ${product.size}`,
  description: product.description,
  sku: product.sku,
  brand: { '@type': 'Brand', name: site.name },
  image: product.images?.[0] ? `${site.url}${product.images[0].src}` : `${site.url}/og/${product.slug}.png`,
  offers: {
    '@type': 'Offer',
    url: `${site.url}/shop/${product.slug}`,
    priceCurrency: 'INR',
    price: (product.price / 100).toFixed(2),
    availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: site.name },
  },
})

export const breadcrumbSchema = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${site.url}${path}` })),
})
