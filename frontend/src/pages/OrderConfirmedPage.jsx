import { useMemo, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { formatINR } from '@ohoney/shared/pricing.js'
import { site, whatsappLink } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import { LAST_ORDER_KEY } from '../lib/last-order.js'
import './OrderConfirmedPage.css'

const noopSubscribe = () => () => {}
const readStored = () => { try { return sessionStorage.getItem(LAST_ORDER_KEY) } catch { return null } }

export default function OrderConfirmedPage() {
  const { state } = useLocation()
  // The prerendered page has no order (undefined); the browser reads this tab's last order.
  const stored = useSyncExternalStore(noopSubscribe, readStored, () => undefined)
  const order = useMemo(() => {
    if (stored === undefined) return undefined
    try { return state?.order ?? JSON.parse(stored ?? 'null') } catch { return null }
  }, [state, stored])

  if (order === undefined) {
    return <div className="container confirmed"><Seo title="Order placed" path="/order/confirmed" noindex /></div>
  }

  if (!order) {
    return (
      <div className="container confirmed">
        <Seo title="Order placed" path="/order/confirmed" noindex />
        <h1>No recent order found</h1>
        <p className="muted">If you placed an order, check your email for the confirmation, or contact us and we’ll look it up.</p>
        <p><Link to="/contact">Contact us</Link> or <Link to="/shop">go to the shop</Link>.</p>
      </div>
    )
  }

  const firstName = order.customer?.name?.split(' ')[0]
  return (
    <div className="container confirmed">
      <Seo title="Order placed" path="/order/confirmed" noindex />
      <p className="confirmed__number">Order {order.number}</p>
      <h1>Thank you{firstName ? `, ${firstName}` : ''}. We’ve got your order.</h1>

      <ol className="confirmed__next">
        <li>
          <h2>We confirm it with you</h2>
          <p className="muted">We’ll call or WhatsApp you on {order.customer?.phone} during business hours to confirm your order and address.</p>
        </li>
        <li>
          <h2>We deliver</h2>
          <p className="muted">Your honey arrives within {site.deliveryTime} of confirmation.</p>
        </li>
        <li>
          <h2>You pay on delivery</h2>
          <p className="muted">Have {formatINR(order.total)} ready in cash for the courier.</p>
        </li>
      </ol>

      {order.confirmationEmailSent && (
        <p>We’ve emailed a copy of your order to <strong>{order.customer?.email}</strong>.</p>
      )}

      <section className="confirmed__summary" aria-labelledby="confirmed-summary">
        <h2 id="confirmed-summary">Order summary</h2>
        <ul role="list">
          {order.items.map((i) => (
            <li key={i.sku}>
              <span>{i.name} {i.size} × {i.qty}</span>
              <span>{formatINR(i.lineTotal)}</span>
            </li>
          ))}
          <li><span>Delivery</span><span>{order.shipping === 0 ? 'Free' : formatINR(order.shipping)}</span></li>
          <li className="confirmed__total"><span>Total to pay on delivery</span><span>{formatINR(order.total)}</span></li>
        </ul>
      </section>

      <p className="muted">
        Questions about your order? Quote {order.number} on <a href={whatsappLink(`Hi, a question about order ${order.number}`)}>WhatsApp</a> or email <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <Link to="/shop" className="btn btn--secondary">Back to the shop</Link>
    </div>
  )
}
