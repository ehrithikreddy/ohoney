import { Link } from 'react-router-dom'
import { products, SHIPPING } from '@ohoney/shared/catalog.js'
import { formatINR } from '@ohoney/shared/pricing.js'
import { site } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import { organizationSchema } from '../seo/schema.js'
import HoneyVessel from '../components/HoneyVessel.jsx'
import ProductArt from '../components/ProductArt.jsx'
import AddToCartButton from '../components/AddToCartButton.jsx'
import './HomePage.css'

const singles = products.filter((p) => p.colour)
const sampler = products.find((p) => !p.colour)

export default function HomePage() {
  return (
    <>
      <Seo path="/" jsonLd={[organizationSchema()]} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <h1 id="hero-title">Raw honey from three corners of South India</h1>
          <p className="lede">
            Wildflower from the Nilgiris, eucalyptus from around Mysore and forest honey from the
            Western Ghats. Packed in small batches and delivered across India.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">Shop honey</Link>
            <Link to="/about" className="link-quiet">Read our story</Link>
          </div>
          <p className="hero__note muted">
            Pay in cash on delivery. Free delivery from {formatINR(SHIPPING.freeFrom)}.
          </p>
        </div>

        <div className="hero__panel on-dark">
          <ul role="list" className="flight" aria-label="Our honeys, lightest to darkest">
            {singles.map((p, i) => (
              <li key={p.sku}>
                <Link to={`/shop/${p.slug}`} className="flight__item">
                  <HoneyVessel colour={p.colour} pour delay={200 + i * 220} />
                  <span className="flight__name">{p.name.replace(' Honey', '')}</span>
                  <span className="flight__region">{p.region}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="range-title">
        <div className="container">
          <header className="range-head">
            <h2 id="range-title">Each honey tastes of where it was made</h2>
            <p className="muted">
              Honey takes its colour and flavour from the flowers the bees visit. Lighter honeys tend
              to be mild and floral; darker ones are usually stronger.
            </p>
          </header>

          <ol role="list" className="range">
            {singles.map((p) => (
              <li key={p.sku} className="range__row">
                <Link to={`/shop/${p.slug}`} className="range__art" tabIndex={-1} aria-hidden="true">
                  <ProductArt product={p} decorative />
                </Link>
                <div className="range__body">
                  <p className="range__origin muted">{p.origin}</p>
                  <h3 className="range__name"><Link to={`/shop/${p.slug}`}>{p.name}</Link></h3>
                  <p className="range__character">{p.character}</p>
                  <p className="range__desc">{p.description}</p>
                  <p className="range__price">
                    <strong>{formatINR(p.price)}</strong> <span className="muted">for {p.size}</span>
                  </p>
                  <div className="range__actions">
                    <AddToCartButton product={p} />
                    <Link to={`/shop/${p.slug}`} className="link-quiet">
                      Details<span className="visually-hidden"> about {p.name}</span>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {sampler && (
        <section className="gift on-dark" aria-labelledby="gift-title">
          <div className="container gift__inner">
            <div className="gift__art"><ProductArt product={sampler} decorative /></div>
            <div className="gift__body">
              <h2 id="gift-title">Can’t choose? Try all three.</h2>
              <p className="muted">{sampler.description}</p>
              <p className="range__price">
                <strong>{formatINR(sampler.price)}</strong> <span className="muted">for {sampler.size}</span>
              </p>
              <div className="range__actions">
                <AddToCartButton product={sampler} />
                <Link to={`/shop/${sampler.slug}`}>About the sampler</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title" className="how-title">How ordering works</h2>
          <ol className="steps">
            <li>
              <h3>Choose your honey</h3>
              <p className="muted">Delivery is free on orders of {formatINR(SHIPPING.freeFrom)} or more, otherwise {formatINR(SHIPPING.flatFee)}.</p>
            </li>
            <li>
              <h3>Place your order</h3>
              <p className="muted">No card needed. You pay in cash when your honey arrives.</p>
            </li>
            <li>
              <h3>We confirm and deliver</h3>
              <p className="muted">We call or WhatsApp you to confirm, then deliver within {site.deliveryTime}.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="trade-title">
        <div className="container trade">
          <div>
            <h2 id="trade-title">Buying for a shop, restaurant or gifting?</h2>
            <p className="muted">We supply businesses across India. Tell us what you need and we’ll send prices.</p>
          </div>
          <Link to="/wholesale" className="btn btn--secondary">Make a wholesale enquiry</Link>
        </div>
      </section>
    </>
  )
}
