// Policy drafts. These are written from the rules already on the site (delivery time,
// shipping fee, damaged-jar promise). Every page is a DRAFT until the client approves it,
// ideally after legal review. Missing business details render as visible markers.
//
// A paragraph is an array of parts: plain strings, { todo } markers, { value, todo }
// (shows the value when set, otherwise the marker), or { to, text } internal links.

import { site } from './site.js'
import { SHIPPING } from '@ohoney/shared/catalog.js'
import { formatINR } from '@ohoney/shared/pricing.js'

const legal = site.legal
const v = (value, todo) => ({ value, todo })

export const policies = {
  shipping: {
    title: 'Shipping',
    description: `Delivery times and charges for ohoney orders across India.`,
    updated: null,
    sections: [
      {
        heading: 'Where we deliver',
        body: [['We deliver to addresses in India. We don’t ship outside India at the moment.']],
      },
      {
        heading: 'Delivery charges',
        body: [
          [`Delivery is free when your order comes to ${formatINR(SHIPPING.freeFrom)} or more. Below that, delivery costs ${formatINR(SHIPPING.flatFee)}. You’ll see the charge at checkout before you place your order.`],
        ],
      },
      {
        heading: 'How long it takes',
        body: [
          [`Most orders arrive within ${site.deliveryTime} of being confirmed. Remote PIN codes can take longer.`],
          ['After you place an order, we contact you by phone or WhatsApp to confirm it before we dispatch. We then send tracking details by email or WhatsApp.'],
        ],
      },
      {
        heading: 'If a delivery fails',
        body: [['If the courier can’t reach you, they usually try again. If the parcel comes back to us, we’ll contact you to arrange another delivery.']],
      },
    ],
  },

  returns: {
    title: 'Returns and refunds',
    description: 'What to do if your honey arrives damaged or isn’t what you ordered.',
    updated: null,
    sections: [
      {
        heading: 'Damaged or wrong items',
        body: [
          [
            'If a jar arrives broken or leaking, or you receive the wrong item, tell us within ',
            v(legal.damageReportDays && `${legal.damageReportDays} days`, 'number of days'),
            ' of delivery. Send a photo of the item and packaging to ',
            { href: `mailto:${site.email}`, text: site.email },
            ' or on WhatsApp.',
          ],
          ['We’ll send a replacement or give you a full refund, whichever you prefer.'],
        ],
      },
      {
        heading: 'Change of mind',
        body: [['Honey is a food product, so we can’t accept returns of opened jars. If you want to cancel an order before it is dispatched, contact us and we’ll cancel it.']],
      },
      {
        heading: 'How refunds are paid',
        body: [['Orders are paid in cash on delivery, so we refund by bank transfer or UPI to an account you name. We aim to pay refunds within 7 working days of agreeing them.']],
      },
    ],
  },

  privacy: {
    title: 'Privacy',
    description: 'What personal information ohoney collects, why, and your choices.',
    updated: null,
    sections: [
      {
        heading: 'Who we are',
        body: [[v(legal.entityName, 'legal entity name'), ' (“ohoney”, “we”) runs this website. Contact us at ', { href: `mailto:${site.email}`, text: site.email }, '.']],
      },
      {
        heading: 'What we collect',
        body: [
          ['When you order: your name, email address, mobile number, delivery address, any delivery notes, and what you ordered.'],
          ['When you send an enquiry: your name, email address, phone number if you give it, and your message. For wholesale enquiries, also your business name, city and expected volume.'],
          ['Our server records technical information such as IP addresses for security and to prevent abuse. We don’t use advertising or analytics cookies.'],
          ['Your cart is stored in your own browser (local storage) so it is still there when you come back. It isn’t sent to us until you place an order.'],
        ],
      },
      {
        heading: 'Why we use it',
        body: [['To confirm, deliver and support your order; to reply to your enquiry; and to meet our legal and tax obligations. We don’t sell your information or use it for marketing without your consent.']],
      },
      {
        heading: 'Who we share it with',
        body: [['Delivery partners (your name, phone and address, to deliver your order), and the providers who host our website, database and email. They may only use it to provide their service to us.']],
      },
      {
        heading: 'How long we keep it',
        body: [['We keep order records for as long as tax and accounting law requires. We delete enquiries we no longer need, usually within 12 months.']],
      },
      {
        heading: 'Your rights',
        body: [
          ['You can ask to see, correct or delete the personal information we hold about you, or withdraw consent, by emailing ', { href: `mailto:${site.email}`, text: site.email }, '.'],
          ['Grievance officer: ', v(legal.grievanceOfficer, 'name and email of grievance officer'), '.'],
        ],
      },
    ],
  },

  terms: {
    title: 'Terms of sale',
    description: 'The terms that apply when you order from ohoney.',
    updated: null,
    sections: [
      {
        heading: 'About us',
        body: [
          ['This website is run by ', v(legal.entityName, 'legal entity name'), ', ', v(legal.registeredAddress, 'registered address'), '.'],
          ['FSSAI licence: ', v(legal.fssaiLicence, 'FSSAI licence number'), '. GSTIN: ', v(legal.gstin, 'GSTIN, or remove this line if not registered'), '.'],
        ],
      },
      {
        heading: 'Orders',
        body: [['When you place an order you receive an order number. We then contact you to confirm the order before dispatch. A contract is formed when we confirm. We may decline or cancel an order, for example if an item is unavailable, and we’ll tell you if we do.']],
      },
      {
        heading: 'Prices and payment',
        body: [['Prices are in Indian rupees and include applicable taxes. Delivery charges are shown at checkout. Payment is cash on delivery to the courier.']],
      },
      {
        heading: 'About the products',
        body: [['Honey is a natural product. Its colour, flavour and texture vary between harvests, and raw honey may crystallise. The colours shown on this site are illustrations, not exact matches.']],
      },
      {
        heading: 'Delivery, returns and refunds',
        body: [['See our ', { to: '/shipping', text: 'shipping policy' }, ' and ', { to: '/returns', text: 'returns and refunds policy' }, '.']],
      },
      {
        heading: 'Complaints and law',
        body: [
          ['Contact us first at ', { href: `mailto:${site.email}`, text: site.email }, '. Grievance officer: ', v(legal.grievanceOfficer, 'name and email of grievance officer'), '.'],
          ['These terms are governed by the laws of India. The courts of ', v(legal.governingCity, 'city'), ' have jurisdiction. Nothing here affects your rights under consumer protection law.'],
        ],
      },
    ],
  },
}
