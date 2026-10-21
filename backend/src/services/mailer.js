import nodemailer from 'nodemailer'

/**
 * Sends email over SMTP. Without SMTP settings (local development) it records
 * the message as skipped instead of sending. Production refuses to start without
 * SMTP unless ALLOW_NO_EMAIL is set (see config.js).
 */
export function createMailer(mail, logger) {
  if (!mail.enabled) {
    return {
      enabled: false,
      async send({ subject }) {
        logger.warn('email not sent: SMTP not configured', { subject })
        return 'skipped'
      },
    }
  }
  const transport = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure,
    auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })
  return {
    enabled: true,
    async send({ to, subject, text, html, replyTo }) {
      await transport.sendMail({ from: mail.from, to, subject, text, html, replyTo })
      return 'sent'
    },
  }
}

/** A mailer that keeps messages in memory, for tests. */
export function createMemoryMailer({ fail = false } = {}) {
  const sent = []
  return {
    enabled: true,
    sent,
    async send(message) {
      if (fail) throw new Error('SMTP unavailable')
      sent.push(message)
      return 'sent'
    },
  }
}
