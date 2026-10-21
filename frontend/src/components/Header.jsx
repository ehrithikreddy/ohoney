import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/cart-context.js'
import { site } from '../content/site.js'
import Icon from './Icon.jsx'
import './Header.css'

const NAV = [
  ['/shop', 'Shop'],
  ['/about', 'Our story'],
  ['/wholesale', 'Wholesale'],
  ['/contact', 'Contact'],
]

export default function Header() {
  const { count, loaded, open: openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const dialog = menuRef.current
    if (!dialog) return
    if (menuOpen && !dialog.open) dialog.showModal()
    if (!menuOpen && dialog.open) dialog.close()
  }, [menuOpen])

  const cartLabel = loaded && count > 0 ? `Cart, ${count} ${count === 1 ? 'item' : 'items'}` : 'Cart'

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="wordmark" aria-label={`${site.name} home`}>
          {site.name}
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul role="list">
            {NAV.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to}>{label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <button type="button" className="cart-button" onClick={openCart} aria-haspopup="dialog" aria-label={cartLabel}>
            <Icon name="cart" />
            <span className="cart-button__text">Cart</span>
            {loaded && count > 0 && <span className="cart-button__count" aria-hidden="true">{count}</span>}
          </button>
          <button
            type="button"
            className="menu-button"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      <dialog ref={menuRef} className="mobile-menu" aria-label="Menu" onClose={() => setMenuOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false) }}>
        <div className="mobile-menu__panel">
          <div className="mobile-menu__top">
            <span className="wordmark" aria-hidden="true">{site.name}</span>
            <button type="button" className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <Icon name="close" size={24} />
            </button>
          </div>
          {/* Following any link closes the menu. */}
          <nav aria-label="Main" onClick={(e) => { if (e.target.closest('a')) setMenuOpen(false) }}>
            <ul role="list" className="mobile-menu__links">
              <li><NavLink to="/" end>Home</NavLink></li>
              {NAV.map(([to, label]) => (
                <li key={to}><NavLink to={to}>{label}</NavLink></li>
              ))}
              <li><NavLink to="/faq">FAQ</NavLink></li>
            </ul>
          </nav>
          <p className="mobile-menu__contact muted">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <br />
            <a href={site.phoneHref}>{site.phoneDisplay}</a>
          </p>
        </div>
      </dialog>
    </header>
  )
}
