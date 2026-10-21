// Opens Razorpay Checkout for an order the API has already created and priced.
// Only used when the API reports Razorpay as enabled.

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript() {
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.onload = resolve
    s.onerror = () => reject(new Error('Couldn’t load the payment window. Check your connection and try again.'))
    document.head.appendChild(s)
  })
}

/** Resolves with Razorpay's success response, or rejects if the window is closed or payment fails. */
export async function payWithRazorpay({ payment, order }) {
  await loadScript()
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: payment.keyId,
      order_id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'ohoney',
      description: `Order ${order.number}`,
      prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.phone },
      theme: { color: '#FBB715' },
      handler: resolve,
      modal: { ondismiss: () => reject(Object.assign(new Error('Payment was cancelled. Your order is saved but unpaid. Try again, or choose cash on delivery.'), { code: 'PAYMENT_CANCELLED' })) },
    })
    rzp.on('payment.failed', (r) => reject(Object.assign(new Error(r?.error?.description || 'The payment didn’t go through. Try again, or choose cash on delivery.'), { code: 'PAYMENT_FAILED' })))
    rzp.open()
  })
}
