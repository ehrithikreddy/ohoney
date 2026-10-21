import { products } from '@ohoney/shared/catalog.js'
import HoneyVessel from './HoneyVessel.jsx'
import './ProductArt.css'

const singles = products.filter((p) => p.colour)

// Shows real photography when the catalogue has it; until then, an illustration of
// the honey's colour. The illustration never imitates packaging.
export default function ProductArt({ product, variant = 'card', decorative = false, priority = false }) {
  const photo = product.images?.[0]
  if (photo) {
    return (
      <img
        className={`product-art product-art--${variant} product-art--photo`}
        src={photo.src}
        alt={decorative ? '' : photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  const shown = product.colour ? [product] : singles
  return (
    <div
      className={`product-art product-art--${variant} on-dark`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : `Illustration of the colour of ${product.name}`}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <div className={`product-art__vessels product-art__vessels--${shown.length}`}>
        {shown.map((p) => (
          <HoneyVessel key={p.sku} colour={p.colour} fill={shown.length > 1 ? 0.62 : 0.8} />
        ))}
      </div>
    </div>
  )
}
