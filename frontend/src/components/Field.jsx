import './Field.css'

/** A labelled form control with hint and error text wired up for assistive tech. */
export default function Field({ form, name, label, hint, error, as: Control = 'input', optional = false, className = '', children, ref, ...props }) {
  const id = `${form}-${name}`
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error">{error}</p>}
      <Control
        ref={ref}
        id={id}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Control>
    </div>
  )
}

/** Lists every error with a link to its field. Receives focus after a failed submit. */
export function ErrorSummary({ form, errors, labels, ref }) {
  const entries = Object.entries(errors).filter(([name]) => labels[name])
  if (!entries.length) return null
  return (
    <div className="error-summary notice notice--error" ref={ref} tabIndex={-1} role="alert" aria-labelledby={`${form}-errors`}>
      <h2 id={`${form}-errors`}>Check the following</h2>
      <ul>
        {entries.map(([name, message]) => (
          <li key={name}><a href={`#${form}-${name}`}>{message}</a></li>
        ))}
      </ul>
    </div>
  )
}

/** Hidden from people; bots that fill it in are ignored by the API. */
export function Honeypot({ value, onChange }) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  )
}
