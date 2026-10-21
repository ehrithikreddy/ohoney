import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/cart-context.js'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import CartDrawer from './CartDrawer.jsx'
import WhatsAppLink from './WhatsAppLink.jsx'

export default function Layout() {
  const { announcement } = useCart()
  const { pathname, hash } = useLocation()
  const mainRef = useRef(null)
  const firstRender = useRef(true)

  // After client-side navigation: go to the top (or the #anchor) and move focus to
  // <main> so keyboard and screen reader users start at the new content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppLink />
      <div className="visually-hidden" role="status" aria-live="polite">{announcement}</div>
    </>
  )
}
