import { loadConfig } from './config.js'
import { createLogger } from './logger.js'
import { createApp } from './app.js'
import { createMemoryStore } from './store/memory.js'
import { createMongoStore } from './store/mongo.js'
import { createMailer } from './services/mailer.js'
import { createRazorpayClient } from './services/razorpay.js'

const logger = createLogger()

let config
try {
  config = loadConfig()
} catch (err) {
  logger.error(err.message)
  process.exit(1)
}

const store = config.mongoUri ? await createMongoStore(config.mongoUri) : createMemoryStore()
if (store.kind === 'memory') logger.warn('MONGODB_URI not set: orders are kept in memory and lost on restart (development only)')

const mailer = createMailer(config.mail, logger)
const razorpay = config.razorpay.enabled ? createRazorpayClient(config.razorpay) : null
const app = createApp({ config, store, mailer, razorpay, logger })

const server = app.listen(config.port, () => {
  logger.info('ohoney api listening', {
    port: config.port, store: store.kind, email: mailer.enabled, razorpay: Boolean(razorpay), static: config.serveStatic,
  })
})

// Finish in-flight requests before exiting on deploys and restarts.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    logger.info('shutting down', { signal })
    server.close(async () => {
      await store.close()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  })
}
