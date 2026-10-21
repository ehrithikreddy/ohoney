import { Fragment } from 'react'
import { Link } from 'react-router-dom'

/** Renders one paragraph in the content "parts" format (see content/policies.js). */
export function Parts({ parts }) {
  return parts.map((part, i) => {
    if (typeof part === 'string') return <Fragment key={i}>{part}</Fragment>
    if (part.to) return <Link key={i} to={part.to}>{part.text}</Link>
    if (part.href) return <a key={i} href={part.href}>{part.text}</a>
    if ('todo' in part && part.value) return <Fragment key={i}>{part.value}</Fragment>
    return <Todo key={i}>{part.todo}</Todo>
  })
}

export function Paragraphs({ body }) {
  return body.map((parts, i) => (
    <p key={i}>
      <Parts parts={parts} />
    </p>
  ))
}

/** A visible marker for business details the client still has to provide. */
export function Todo({ children }) {
  return <em className="todo">[To be provided: {children}]</em>
}
