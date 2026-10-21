// Email content for orders and enquiries. Every customer-supplied value is escaped
// in the HTML versions.

import { formatINR } from '@ohoney/shared/pricing.js'

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const paymentLabel = (order) =>
  order.payment.method === 'cod' ? `Cash on delivery: collect ${formatINR(order.total)}` : `Paid online (Razorpay ${order.payment.razorpayPaymentId ?? ''})`

const itemLines = (order) => order.items.map((i) => `${i.qty} × ${i.name} ${i.size}  ${formatINR(i.lineTotal)}`)

const addressLines = (a) => [a.address1, a.address2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean)

function totalsText(order) {
  return [
    ...itemLines(order),
    `Delivery  ${order.shipping === 0 ? 'Free' : formatINR(order.shipping)}`,
    `Total  ${formatINR(order.total)}`,
  ].join('\n')
}

function totalsHtml(order) {
  const row = (l, r, strong) => `<tr><td style="padding:4px 12px 4px 0">${strong ? `<strong>${l}</strong>` : l}</td><td style="padding:4px 0;text-align:right">${strong ? `<strong>${r}</strong>` : r}</td></tr>`
  return `<table style="border-collapse:collapse">${order.items.map((i) => row(`${i.qty} × ${esc(i.name)} ${esc(i.size)}`, formatINR(i.lineTotal))).join('')}${row('Delivery', order.shipping === 0 ? 'Free' : formatINR(order.shipping))}${row('Total', formatINR(order.total), true)}</table>`
}

export function businessOrderEmail(order) {
  const flag = order.flags?.honeypot ? '[CHECK: possible spam] ' : ''
  const c = order.customer
  return {
    subject: `${flag}New order ${order.number}: ${formatINR(order.total)} (${order.payment.method === 'cod' ? 'COD' : 'paid online'})`,
    replyTo: c.email,
    text: [
      `New order ${order.number}`,
      '',
      paymentLabel(order),
      '',
      `${c.name}`,
      `Phone: ${c.phone}`,
      `Email: ${c.email}`,
      '',
      ...addressLines(order.address),
      order.notes ? `\nDelivery notes: ${order.notes}` : '',
      '',
      totalsText(order),
      '',
      'Next: call or WhatsApp the customer to confirm before dispatch.',
    ].join('\n'),
    html: `<p><strong>New order ${esc(order.number)}</strong></p>
<p>${esc(paymentLabel(order))}</p>
<p>${esc(c.name)}<br>Phone: <a href="tel:+91${esc(c.phone)}">${esc(c.phone)}</a><br>Email: ${esc(c.email)}</p>
<p>${addressLines(order.address).map(esc).join('<br>')}</p>
${order.notes ? `<p>Delivery notes: ${esc(order.notes)}</p>` : ''}
${totalsHtml(order)}
<p>Next: call or WhatsApp the customer to confirm before dispatch.</p>`,
  }
}

export function customerOrderEmail(order, { siteUrl, deliveryTime = '3 to 5 working days' }) {
  const first = order.customer.name.split(' ')[0]
  const pay = order.payment.method === 'cod' ? `Please have ${formatINR(order.total)} ready in cash for the courier.` : 'Your payment has been received.'
  return {
    subject: `Your ohoney order ${order.number}`,
    text: [
      `Hi ${first},`,
      '',
      `Thank you for your order. Your order number is ${order.number}.`,
      '',
      'What happens next:',
      '1. We call or WhatsApp you to confirm your order and address.',
      `2. We deliver within ${deliveryTime} of confirmation.`,
      `3. ${pay}`,
      '',
      totalsText(order),
      '',
      'Delivering to:',
      ...addressLines(order.address),
      '',
      `Questions? Reply to this email and quote ${order.number}.`,
      '',
      'ohoney',
      siteUrl,
    ].join('\n'),
    html: `<p>Hi ${esc(first)},</p>
<p>Thank you for your order. Your order number is <strong>${esc(order.number)}</strong>.</p>
<p><strong>What happens next</strong></p>
<ol><li>We call or WhatsApp you to confirm your order and address.</li><li>We deliver within ${esc(deliveryTime)} of confirmation.</li><li>${esc(pay)}</li></ol>
${totalsHtml(order)}
<p>Delivering to:<br>${addressLines(order.address).map(esc).join('<br>')}</p>
<p>Questions? Reply to this email and quote ${esc(order.number)}.</p>
<p>ohoney<br><a href="${esc(siteUrl)}">${esc(siteUrl)}</a></p>`,
  }
}

export function businessEnquiryEmail(enquiry) {
  const label = enquiry.type === 'wholesale' ? 'Wholesale enquiry' : 'Website message'
  const fields = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone],
    ['Business', enquiry.business],
    ['City', enquiry.city],
    ['Monthly quantity', enquiry.volume],
  ].filter(([, v]) => v)
  return {
    subject: `${label} from ${enquiry.business || enquiry.name}`,
    replyTo: enquiry.email,
    text: [...fields.map(([k, v]) => `${k}: ${v}`), '', enquiry.message || '(no message)'].join('\n'),
    html: `<p>${fields.map(([k, v]) => `${k}: ${esc(v)}`).join('<br>')}</p><p style="white-space:pre-wrap">${esc(enquiry.message || '(no message)')}</p>`,
  }
}
