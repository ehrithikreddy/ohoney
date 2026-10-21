// Vercel Function: every /api/* request is rewritten here (see vercel.json) and handled
// by the Express app in backend/. Configure it with environment variables in the Vercel
// dashboard (MONGODB_URI, SMTP_*, MAIL_FROM, ORDER_NOTIFY_EMAIL); see docs/CLIENT_HANDOFF.md.
import { createServerlessHandler } from '../../backend/src/serverless.js'

export default createServerlessHandler()
