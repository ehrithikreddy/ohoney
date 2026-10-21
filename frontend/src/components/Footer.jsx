import { Link } from 'react-router-dom'
import { products } from '@ohoney/shared/catalog.js'
import { site } from '../content/site.js'
import { Todo } from './RichText.jsx'
import './Footer.css'

const columns = [
  ['Shop', [['/shop', 'All honey'], ...products.map((p) => [`/shop/${p.slug}`, p.name])]],
  ['Help', [['/faq', 'FAQ'], ['/shipping', 'Shipping'], ['/returns', 'Returns and refunds'], ['/contact', 'Contact us']]],
  ['ohoney', [['/about', 'Our story'], ['/wholesale', 'Wholesale'], ['/privacy', 'Privacy'], ['/terms', 'Terms of sale']]],
]

export default function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/" className="wordmark site-footer__wordmark">{site.name}</Link>
          <p className="muted">{site.tagline}. Based in {site.basedIn}, delivering across India.</p>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <br />
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
          </p>
        </div>
        {columns.map(([heading, links]) => (
          <nav key={heading} aria-label={heading === 'ohoney' ? 'Company' : heading} className="site-footer__col">
            <h2 className="site-footer__heading">{heading}</h2>
            <ul role="list">
              {links.map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container site-footer__legal">
        <p>© {new Date().getFullYear()} {site.legal.entityName ?? site.name}</p>
        <p>FSSAI licence {site.legal.fssaiLicence ?? <Todo>FSSAI licence number</Todo>}</p>
      </div>
    </footer>
  )
}
