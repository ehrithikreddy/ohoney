import { useRef, useState } from 'react'
import { validateEnquiry } from '@ohoney/shared/validation.js'
import { postJSON } from '../lib/api.js'
import { useForm } from '../lib/useForm.js'
import { site } from '../content/site.js'
import Field, { ErrorSummary, Honeypot } from './Field.jsx'
import Icon from './Icon.jsx'

const FIELDS = {
  contact: {
    initial: { type: 'contact', name: '', email: '', phone: '', message: '' },
    labels: { name: 'Your name', email: 'Email', phone: 'Mobile number', message: 'Message' },
    submit: 'Send message',
    sent: 'Message sent',
    reply: 'We reply within 24 hours.',
  },
  wholesale: {
    initial: { type: 'wholesale', business: '', name: '', email: '', phone: '', city: '', volume: '', message: '' },
    labels: { business: 'Business name', name: 'Your name', email: 'Email', phone: 'Mobile number', city: 'City', volume: 'Expected monthly quantity', message: 'What you need' },
    submit: 'Send enquiry',
    sent: 'Enquiry sent',
    reply: 'We’ll get back to you within 48 hours.',
  },
}

export default function EnquiryForm({ type }) {
  const config = FIELDS[type]
  const form = useForm(validateEnquiry, config.initial)
  const { values, errors, onChange } = form
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [problem, setProblem] = useState(null)
  const summaryRef = useRef(null)
  const resultRef = useRef(null)
  const id = `enquiry-${type}`

  const field = (name) => ({ form: id, name, label: config.labels[name], value: values[name], onChange, error: errors[name] })

  async function onSubmit(e) {
    e.preventDefault()
    setProblem(null)
    const clean = form.check()
    if (!clean) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setStatus('sending')
    try {
      await postJSON('/api/enquiries', { ...clean, website: honeypot })
      setStatus('sent')
      form.reset()
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch (err) {
      setStatus('idle')
      if (err.code === 'VALIDATION' && err.details.fields) {
        form.setErrors(err.details.fields)
        requestAnimationFrame(() => summaryRef.current?.focus())
      } else {
        setProblem(err.message)
        requestAnimationFrame(() => resultRef.current?.focus())
      }
    }
  }

  if (status === 'sent') {
    return (
      <div className="notice notice--success enquiry-sent" role="status" tabIndex={-1} ref={resultRef}>
        <p><Icon name="check" /> <strong>{config.sent}.</strong> {config.reply}</p>
        <button type="button" className="text-button" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="enquiry-form" aria-label={type === 'wholesale' ? 'Wholesale enquiry' : 'Contact form'}>
      <ErrorSummary ref={summaryRef} form={id} errors={errors} labels={config.labels} />
      <div className="form-grid">
        {type === 'wholesale' && <Field {...field('business')} className="span-2" autoComplete="organization" />}
        <Field {...field('name')} autoComplete="name" />
        <Field {...field('email')} type="email" autoComplete="email" />
        <Field {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" optional={type === 'contact'} />
        {type === 'wholesale' && <Field {...field('city')} autoComplete="address-level2" />}
        {type === 'wholesale' && <Field {...field('volume')} optional hint="For example, 20 kg or 100 jars." />}
        <Field {...field('message')} as="textarea" className="span-2" rows={5} optional={type === 'wholesale'}
          hint={type === 'wholesale' ? 'Which honeys, sizes and any labelling you need.' : undefined} />
      </div>
      <Honeypot value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      {problem && (
        <div className="notice notice--error" role="alert" tabIndex={-1} ref={resultRef}>
          <p>{problem}</p>
          <p className="muted">You can also email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
        </div>
      )}
      <button type="submit" className="btn btn--primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : config.submit}
      </button>
    </form>
  )
}
