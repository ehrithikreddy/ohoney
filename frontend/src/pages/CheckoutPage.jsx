import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatINR } from '@ohoney/shared/pricing.js'
import { INDIAN_STATES, validateCheckout } from '@ohoney/shared/validation.js'
import { useCart } from '../context/cart-context.js'
import { postJSON, newIdempotencyKey } from '../lib/api.js'
import { useForm } from '../lib/useForm.js'
import { site } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import Field, { ErrorSummary, Honeypot } from '../components/Field.jsx'
import ProductArt from '../components/ProductArt.jsx'
import { LAST_ORDER_KEY } from '../lib/last-order.js'
import './CheckoutPage.css'

const INITIAL = { name: '', email: '', phone: '', address1: '', address2: '', city: '', state: '', pincode: '', notes: '' }
const LABELS = {
  name: 'Full name', email: 'Email', phone: 'Mobile number', address1: 'House number and street',
  address2: 'Area or landmark', city: 'Town or city', state: 'State', pincode: 'PIN code', notes: 'Delivery notes',
}

export default function CheckoutPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const form = useForm(validateCheckout, INITIAL)
  const { values, errors, onChange } = form
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [problem, setProblem] = useState(null)
  const summaryRef = useRef(null)
  const problemRef = useRef(null)
  const idempotencyKey = useRef(null)

  // A retry of the same order reuses its key so the server can't create it twice;
  // any edit to the form or cart makes it a new order.
  useEffect(() => { idempotencyKey.current = null }, [values, cart.lines])

  if (!cart.loaded) {
    return (
      <div className="container state-page">
        <Seo title="Checkout" path="/checkout" noindex />
        <h1>Checkout</h1>
        <p className="muted">Loading your cart…</p>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="container state-page">
        <Seo title="Checkout" path="/checkout" noindex />
        <h1>Your cart is empty</h1>
        <p className="muted">Add some honey, then come back here to place your order.</p>
        <Link to="/shop" className="btn btn--primary">Browse the honey</Link>
      </div>
    )
  }

  const { totals } = cart
  const field = (name) => ({ form: 'checkout', name, label: LABELS[name], value: values[name], onChange, error: errors[name] })

  async function onSubmit(e) {
    e.preventDefault()
    setProblem(null)
    const clean = form.check()
    if (!clean) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    if (cart.hasUnavailable) {
      setProblem('Some items in your cart are unavailable. Remove them to continue.')
      return
    }

    idempotencyKey.current ??= newIdempotencyKey()
    setSubmitting(true)
    try {
      const { order } = await postJSON(
        '/api/orders',
        { ...clean, items: cart.lines, paymentMethod: 'cod', expectedTotal: totals.total, website: honeypot },
        { idempotencyKey: idempotencyKey.current },
      )
      try { sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order)) } catch { /* shown from memory below */ }
      cart.clear()
      navigate('/order/confirmed', { replace: true, state: { order } })
    } catch (err) {
      setSubmitting(false)
      if (err.code === 'VALIDATION' && err.details.fields) {
        form.setErrors(err.details.fields)
        requestAnimationFrame(() => summaryRef.current?.focus())
        return
      }
      setProblem(err.message)
      requestAnimationFrame(() => problemRef.current?.focus())
    }
  }

  return (
    <div className="container checkout">
      <Seo title="Checkout" path="/checkout" noindex />
      <h1 className="checkout__title">Checkout</h1>

      <div className="checkout__grid">
        <aside className="checkout__summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Your order</h2>
          <ul role="list" className="summary-lines">
            {cart.items.map(({ sku, qty, product }) => (
              <li key={sku}>
                <div className="summary-lines__art"><ProductArt product={product} variant="thumb" decorative /></div>
                <div>
                  <span className="summary-lines__name">{product.name}</span>
                  <span className="muted">{product.size} × {qty}</span>
                </div>
                <span className="summary-lines__price">{formatINR(product.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary-totals">
            <div><dt>Subtotal</dt><dd>{formatINR(totals.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{totals.shipping === 0 ? 'Free' : formatINR(totals.shipping)}</dd></div>
            <div className="summary-totals__total"><dt>Total</dt><dd>{formatINR(totals.total)}</dd></div>
          </dl>
          <button type="button" className="text-button" onClick={cart.open}>Edit cart</button>
        </aside>

        <form className="checkout__form" onSubmit={onSubmit} noValidate aria-describedby="checkout-intro">
          <p id="checkout-intro" className="muted">
            We deliver across India. You pay in cash when your order arrives. All fields are required unless marked optional.
          </p>

          <ErrorSummary ref={summaryRef} form="checkout" errors={errors} labels={LABELS} />

          <fieldset>
            <legend><h2>Contact details</h2></legend>
            <div className="form-grid">
              <Field {...field('name')} className="span-2" autoComplete="name" />
              <Field {...field('email')} type="email" autoComplete="email" hint="For your order confirmation." />
              <Field {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" hint="We call or WhatsApp to confirm your order." />
            </div>
          </fieldset>

          <fieldset>
            <legend><h2>Delivery address</h2></legend>
            <div className="form-grid">
              <Field {...field('address1')} className="span-2" autoComplete="address-line1" />
              <Field {...field('address2')} className="span-2" optional autoComplete="address-line2" />
              <Field {...field('city')} autoComplete="address-level2" />
              <Field {...field('pincode')} inputMode="numeric" autoComplete="postal-code" maxLength={7} />
              <Field {...field('state')} as="select" className="span-2" autoComplete="address-level1">
                <option value="">Choose a state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Field>
              <Field {...field('notes')} as="textarea" className="span-2" optional rows={3} hint="For example, a landmark or a good time to deliver." />
            </div>
          </fieldset>

          <fieldset>
            <legend><h2>Payment</h2></legend>
            <label className="pay-option">
              <input type="radio" name="paymentMethod" value="cod" checked readOnly />
              <span>
                <strong>Cash on delivery</strong>
                <span className="muted">Pay {formatINR(totals.total)} to the courier when your order arrives.</span>
              </span>
            </label>
          </fieldset>

          <Honeypot value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

          {problem && (
            <div className="notice notice--error" role="alert" tabIndex={-1} ref={problemRef}>
              <p>{problem}</p>
              <p className="muted">If this keeps happening, message us on WhatsApp at {site.phoneDisplay}.</p>
            </div>
          )}

          <div className="checkout__submit">
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting} aria-busy={submitting}>
              {submitting ? 'Placing your order…' : `Place order (${formatINR(totals.total)})`}
            </button>
            <p className="muted">
              By placing your order you agree to our <Link to="/terms">terms of sale</Link>. See how we use your details in our <Link to="/privacy">privacy policy</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
