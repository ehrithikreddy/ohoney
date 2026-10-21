import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findBySlug, MAX_QTY_PER_ITEM, productFacts, products, SHIPPING } from '@ohoney/shared/catalog.js'
import { formatINR } from '@ohoney/shared/pricing.js'
import { site } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import { breadcrumbSchema, productSchema } from '../seo/schema.js'
import ProductArt from '../components/ProductArt.jsx'
import QuantityStepper from '../components/QuantityStepper.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './ProductPage.css'

export default function ProductPage() {
  const { slug } = useParams()
  const product = findBySlug(slug)
  if (!product) return <NotFoundPage />
  // Keyed so quantity resets when moving between products.
  return <ProductView key={product.sku} product={product} />
}

function ProductView({ product }) {
  const [qty, setQty] = useState(1)

  const others = products.filter((p) => p.sku !== product.sku)
  const path = `/shop/${product.slug}`

  return (
    <>
      <Seo
        title={`${product.name} ${product.size}`}
        path={path}
        type="product"
        image={product.images?.[0]?.src || `/og/${product.slug}.png`}
        description={`${product.summary} ${product.origin}. ${formatINR(product.price)} for ${product.size}. Delivered across India, pay on delivery.`}
        jsonLd={[productSchema(product), breadcrumbSchema([['Shop', '/shop'], [product.name, path]])]}
      />

      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol role="list">
            <li><Link to="/shop">Shop</Link></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="pdp">
          <div className="pdp__media">
            <ProductArt product={product} variant="hero" priority />
            {!product.images?.length && <p className="pdp__media-note muted">Illustration of the honey’s colour.</p>}
          </div>

          <div className="pdp__info">
            <p className="muted">{product.origin}</p>
            <h1>{product.name}</h1>
            <p className="pdp__character">{product.character}</p>

            <p className="pdp__price">
              <strong>{formatINR(product.price)}</strong>
              <span className="muted"> for {product.size}</span>
            </p>

            {product.available ? (
              <div className="pdp__buy">
                <QuantityStepper value={qty} onChange={setQty} max={MAX_QTY_PER_ITEM} label={`Quantity of ${product.name}`} />
                <AddToCartButton product={product} qty={qty}>
                  Add to cart{qty > 1 ? ` (${qty})` : ''}
                </AddToCartButton>
              </div>
            ) : (
              <p className="notice">This honey is unavailable right now. <Link to="/contact">Ask us when it’s back</Link>.</p>
            )}

            <ul role="list" className="pdp__assurances">
              <li>Free delivery from {formatINR(SHIPPING.freeFrom)}, otherwise {formatINR(SHIPPING.flatFee)}</li>
              <li>Pay in cash on delivery</li>
              <li>Delivered within {site.deliveryTime}</li>
            </ul>

            <div className="pdp__section">
              <p>{product.description}</p>
            </div>

            <div className="pdp__section">
              <h2>Good for</h2>
              <ul className="pdp__uses">
                {product.uses.map((u) => <li key={u}>{u}</li>)}
              </ul>
            </div>

            <dl className="pdp__facts">
              <div><dt>Origin</dt><dd>{product.origin}</dd></div>
              <div><dt>Size</dt><dd>{product.size}</dd></div>
              <div><dt>Ingredients</dt><dd>{productFacts.ingredients}</dd></div>
              <div><dt>Storage</dt><dd>{productFacts.storage}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <section className="section section--tint pdp-others" aria-labelledby="others-title">
        <div className="container">
          <h2 id="others-title">You might also like</h2>
          <ul role="list" className="pdp-others__list">
            {others.map((p) => (
              <li key={p.sku}>
                <Link to={`/shop/${p.slug}`} className="pdp-others__item">
                  <ProductArt product={p} variant="thumb" decorative />
                  <span>
                    <span className="pdp-others__name">{p.name}</span>
                    <span className="muted">{formatINR(p.price)}, {p.size}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
