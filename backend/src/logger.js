// One JSON object per line, for the hosting provider's log viewer.
// Never pass customer details (name, email, phone, address, message) to the logger:
// log order numbers and counts instead.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 }

export function createLogger({ level = process.env.LOG_LEVEL || 'info', sink = console } = {}) {
  const min = LEVELS[level] ?? LEVELS.info
  const write = (lvl) => (msg, fields = {}) => {
    if (LEVELS[lvl] < min) return
    const entry = { time: new Date().toISOString(), level: lvl, msg, ...fields }
    if (fields.err instanceof Error) entry.err = { message: fields.err.message, code: fields.err.code, stack: fields.err.stack }
    ;(lvl === 'error' || lvl === 'warn' ? sink.error : sink.log)(JSON.stringify(entry))
  }
  return { debug: write('debug'), info: write('info'), warn: write('warn'), error: write('error') }
}

/** A logger that records entries in memory, for tests. */
export function createMemoryLogger() {
  const entries = []
  const write = (level) => (msg, fields = {}) => entries.push({ level, msg, ...fields })
  return { entries, debug: write('debug'), info: write('info'), warn: write('warn'), error: write('error') }
}
