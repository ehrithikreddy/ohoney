import { Link } from 'react-router-dom'
import { products } from '@ohoney/shared/catalog.js'
import { site } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import HoneyVessel from '../components/HoneyVessel.jsx'
import './AboutPage.css'

const singles = products.filter((p) => p.colour)

export default function AboutPage() {
  return (
    <>
      <Seo
        title="Our story"
        path="/about"
        description="Why we started ohoney: raw honey from beekeepers we trust in the Nilgiris, around Mysore and in the Western Ghats, sold from Hyderabad."
      />

      <article>
        <header className="container story-head">
          <h1>We started ohoney because we couldn’t find honey we trusted</h1>
          <p className="lede">So we went looking for the people who make it well.</p>
        </header>

        <div className="container story-body prose">
          <p>
            Supermarket shelves are full of honey, but much of it has been heated, filtered and blended
            until it tastes of very little. We wanted honey that tastes of the place it came from, from
            beekeepers we know.
          </p>
          <p>
            That search took us to three very different landscapes in South India. Each gives a honey
            with its own colour and character, and we sell them side by side so you can taste the difference.
          </p>
          <p className="story-promise">Our promise is simple: every jar is exactly what the label says.</p>
        </div>

        <section className="places on-dark" aria-labelledby="places-title">
          <div className="container">
            <h2 id="places-title">Three places, three honeys</h2>
            <ol role="list" className="places__list">
              {singles.map((p) => (
                <li key={p.sku} className="places__item">
                  <div className="places__vessel"><HoneyVessel colour={p.colour} /></div>
                  <div>
                    <h3>{p.origin}</h3>
                    <p className="muted">{p.description}</p>
                    <Link to={`/shop/${p.slug}`}>Shop {p.name}</Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" aria-labelledby="visit-title">
          <div className="container story-close">
            <h2 id="visit-title">From Hyderabad to your door</h2>
            <p className="muted">
              We’re based in {site.basedIn} and deliver across India. If you have a question about our honey
              or how it’s made, ask us. We’re happy to talk about it.
            </p>
            <div className="story-close__actions">
              <Link to="/shop" className="btn btn--primary">Shop honey</Link>
              <Link to="/contact" className="link-quiet">Get in touch</Link>
            </div>
          </div>
        </section>
      </article>
    </>
  )
}
