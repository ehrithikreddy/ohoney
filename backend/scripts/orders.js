// Operations helper for the developer. Uses the same environment variables as the API.
//
//   npm run orders -- list [days]           Recent orders and whether their emails went out (default 7 days)
//   npm run orders -- resend-failed [days]  Re-send order emails that failed (e.g. during an SMTP outage)
//
// Prints customer names and phone numbers: run it only in a trusted terminal.

import { loadConfig } from '../src/config.js'
import { createLogger } from '../src/logger.js'
import { createMongoStore } from '../src/store/mongo.js'
import { createMailer } from '../src/services/mailer.js'
import { createShopService } from '../src/services/shop.js'
import { formatINR } from '@ohoney/shared/pricing.js'

const [command = 'list', daysArg = '7'] = process.argv.slice(2)
const days = Number(daysArg)
if (!['list', 'resend-failed'].includes(command) || !(days > 0)) {
  console.error('Usage: npm run orders -- list [days] | resend-failed [days]')
  process.exit(2)
}

const config = loadConfig()
if (!config.mongoUri) {
  console.error('Set MONGODB_URI (for example in backend/.env).')
  process.exit(2)
}
const logger = createLogger({ level: 'warn' })
const store = await createMongoStore(config.mongoUri)
try {
  const orders = await store.orders.list({ since: new Date(Date.now() - days * 86_400_000), limit: 500 })

  if (command === 'list') {
    console.table(
      orders.map((o) => ({
        number: o.number,
        placed: o.createdAt.toISOString().slice(0, 16).replace('T', ' '),
        total: formatINR(o.total),
        payment: `${o.payment.method}/${o.payment.status}`,
        customer: o.customer.name,
        phone: o.customer.phone,
        'email to shop': o.notifications?.business ?? '-',
        'email to customer': o.notifications?.customer ?? '-',
        flagged: o.flags?.honeypot ? 'yes' : '',
      })),
    )
  } else {
    const shop = createShopService({ store, mailer: createMailer(config.mail, logger), config, logger })
    const failed = orders.filter((o) => o.notifications?.business === 'failed' || o.notifications?.customer === 'failed')
    for (const o of failed) {
      const after = await shop.retryNotifications(o.number)
      console.log(`${o.number}: shop ${after.notifications.business}, customer ${after.notifications.customer}`)
    }
    console.log(`${failed.length} order(s) had failed emails.`)
  }
} finally {
  await store.close()
}
