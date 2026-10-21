// Answers use the same parts format as policies.js. Every answer here is listed for
// client confirmation in docs/CLIENT_HANDOFF.md.

import { site } from './site.js'
import { SHIPPING, productFacts } from '@ohoney/shared/catalog.js'
import { formatINR } from '@ohoney/shared/pricing.js'

export const faqGroups = [
  {
    heading: 'Ordering and delivery',
    items: [
      {
        q: 'How do I pay?',
        a: [['You pay in cash when your order arrives. After you order, we call or WhatsApp you to confirm before we dispatch.']],
      },
      {
        q: 'How long does delivery take?',
        a: [[`Most orders arrive within ${site.deliveryTime} of being confirmed, anywhere in India.`]],
      },
      {
        q: 'How much is delivery?',
        a: [[`Free on orders of ${formatINR(SHIPPING.freeFrom)} or more. Otherwise ${formatINR(SHIPPING.flatFee)}.`]],
      },
      {
        q: 'Do you ship outside India?',
        a: [['Not yet. We deliver within India only.']],
      },
      {
        q: 'What if my jar arrives damaged?',
        a: [['Send us a photo and we’ll replace it or refund you. See ', { to: '/returns', text: 'returns and refunds' }, '.']],
      },
    ],
  },
  {
    heading: 'The honey',
    items: [
      {
        q: 'Why has my honey turned solid?',
        a: [['Raw honey crystallises naturally over time, especially when it’s cool. It is still good to eat. To soften it, stand the closed jar in warm (not boiling) water and stir.']],
      },
      {
        q: 'How should I store it?',
        a: [[productFacts.storage]],
      },
      {
        q: 'Why do the honeys look and taste so different?',
        a: [['Honey takes its colour and flavour from the flowers the bees visit. Lighter honeys tend to be mild and floral; darker ones are usually stronger.']],
      },
    ],
  },
  {
    heading: 'Wholesale and gifting',
    items: [
      {
        q: 'Do you supply businesses?',
        a: [['Yes. We supply shops, restaurants, hotels and corporate gifting companies. ', { to: '/wholesale', text: 'Send a wholesale enquiry' }, '.']],
      },
      {
        q: 'Do you have a gift option?',
        a: [['The ', { to: '/shop/honey-sampler', text: 'Honey Sampler' }, ' has all three honeys in a gift box.']],
      },
    ],
  },
]
