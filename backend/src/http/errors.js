// Errors the API returns on purpose. Anything else becomes a generic 500 and is logged.

export class HttpError extends Error {
  constructor(status, code, message, details = {}) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (code, message, details) => new HttpError(400, code, message, details)
export const conflict = (code, message, details) => new HttpError(409, code, message, details)
export const notFound = (message = 'Not found.') => new HttpError(404, 'NOT_FOUND', message)

export function errorHandler(logger) {
  // Express recognises error handlers by their four arguments, so `next` must stay.
  return (err, req, res, next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message, ...err.details } })
    }
    // Malformed or oversized request bodies from express.json()
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: { code: 'TOO_LARGE', message: 'That request is too large.' } })
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'BAD_JSON', message: 'The request body is not valid JSON.' } })
    }
    // Client errors raised by Express middleware, e.g. a missing static asset.
    if (err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ error: { code: err.status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST', message: err.status === 404 ? 'Not found.' : 'Bad request.' } })
    }
    logger.error('unhandled error', { requestId: req.id, path: req.path, err })
    res.status(500).json({
      error: { code: 'SERVER', message: 'Something went wrong on our side. Please try again in a minute.', requestId: req.id },
    })
  }
}
