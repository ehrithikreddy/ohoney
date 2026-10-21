import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { amountToFreeShipping, formatINR } from '@ohoney/shared/pricing.js'
import { useCart } from '../context/cart-context.js'
import Icon from './Icon.jsx'
import ProductArt from './ProductArt.jsx'
import QuantityStepper from './QuantityStepper.jsx'
import './CartDrawer.css'

export default function CartDrawer() {
  const cart = useCart()
  const { isOpen, close, items, totals, setQty, remove, maxQty, hasUnavailable } = cart
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const toFree = amountToFreeShipping(totals.subtotal)

  return (
    <dialog ref={ref} className="drawer" aria-labelledby="drawer-title" onClose={close}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="drawer__panel">
        <header className="drawer__header">
          <h2 id="drawer-title">Your cart</h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close cart">
            <Icon name="close" size={24} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn--primary" onClick={close}>Browse the honey</Link>
          </div>
        ) : (
          <>
            <ul role="list" className="drawer__lines">
              {items.map(({ sku, qty, product }) => (
                <li key={sku} className="drawer__line">
                  <div className="drawer__art"><ProductArt product={product} variant="thumb" decorative /></div>
                  <div className="drawer__info">
                    <Link to={`/shop/${product.slug}`} onClick={close} className="drawer__name">{product.name}</Link>
                    <span className="muted">{product.size}</span>
                    {product.available ? (
                      <div className="drawer__controls">
                        <QuantityStepper size="sm" value={qty} max={maxQty} onChange={(q) => setQty(sku, q)} label={`Quantity of ${product.name}`} />
                        <button type="button" className="text-button" onClick={() => remove(sku)}>
                          Remove<span className="visually-hidden"> {product.name}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="drawer__unavailable">
                        Not available right now.{' '}
                        <button type="button" className="text-button" onClick={() => remove(sku)}>Remove it</button>
                      </p>
                    )}
                  </div>
                  <span className="drawer__price">{product.available ? formatINR(product.price * qty) : '–'}</span>
                </li>
              ))}
            </ul>

            <footer className="drawer__footer">
              <dl className="drawer__totals">
                <div><dt>Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>{totals.shipping === 0 ? 'Free' : formatINR(totals.shipping)}</dd></div>
                <div className="drawer__total"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
              </dl>
              {toFree > 0 && totals.subtotal > 0 && (
                <p className="drawer__hint">Add {formatINR(toFree)} more for free delivery.</p>
              )}
              <button
                type="button"
                className="btn btn--primary btn--block"
                disabled={hasUnavailable || totals.items.length === 0}
                onClick={() => { close(); navigate('/checkout') }}
              >
                Check out
              </button>
              {hasUnavailable && <p className="drawer__hint">Remove unavailable items to check out.</p>}
              <p className="drawer__note muted">Pay in cash on delivery.</p>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
