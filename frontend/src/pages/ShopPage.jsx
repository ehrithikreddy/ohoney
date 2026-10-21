import { Link } from 'react-router-dom'
import { products, SHIPPING } from '@ohoney/shared/catalog.js'
import { formatINR } from '@ohoney/shared/pricing.js'
import Seo from '../seo/Seo.jsx'
import ProductArt from '../components/ProductArt.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import './ShopPage.css'

export default function ShopPage() {
  return (
    <>
      <Seo
        title="Shop honey"
        path="/shop"
        description="Wildflower, Eucalyptus and Forest honey, and a sampler of all three. Raw honey from South India, delivered across India. Pay on delivery."
      />
      <div className="container page-head">
        <h1>Shop honey</h1>
        <p className="lede">
          Three honeys from three places, lightest to darkest, and a box with all of them. Free delivery from {formatINR(SHIPPING.freeFrom)}. Pay on delivery.
        </p>
      </div>

      <div className="container">
        <ul role="list" className="shop-grid">
          {products.map((p, i) => (
            <li key={p.sku} className="shop-card">
              <Link to={`/shop/${p.slug}`} className="shop-card__art" tabIndex={-1} aria-hidden="true">
                <ProductArt product={p} decorative priority={i < 2} />
              </Link>
              <div className="shop-card__body">
                <h2 className="shop-card__name"><Link to={`/shop/${p.slug}`}>{p.name}</Link></h2>
                <p className="muted">{p.character}. {p.region}.</p>
                <p className="shop-card__price"><strong>{formatINR(p.price)}</strong> <span className="muted">{p.size}</span></p>
              </div>
              <AddToCartButton product={p} className="btn--block" />
            </li>
          ))}
        </ul>
      </div>
      <div className="section-spacer" />
    </>
  )
}
