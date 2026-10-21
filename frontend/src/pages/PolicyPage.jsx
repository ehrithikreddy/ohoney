import { Link } from 'react-router-dom'
import { policies } from '../content/policies.js'
import Seo from '../seo/Seo.jsx'
import { Paragraphs } from '../components/RichText.jsx'
import { slug } from '../lib/slug.js'

export default function PolicyPage({ name }) {
  const policy = policies[name]
  return (
    <>
      <Seo title={policy.title} path={`/${name}`} description={policy.description} />
      <article className="container container--narrow">
        <header className="page-head">
          <h1>{policy.title}</h1>
          {policy.updated && <p className="muted">Last updated {policy.updated}</p>}
        </header>
        <div className="prose">
          {policy.sections.map((s) => (
            <section key={s.heading} aria-labelledby={`${name}-${slug(s.heading)}`}>
              <h2 id={`${name}-${slug(s.heading)}`}>{s.heading}</h2>
              <Paragraphs body={s.body} />
            </section>
          ))}
          <p className="muted">Questions about this policy? <Link to="/contact">Contact us</Link>.</p>
        </div>
      </article>
      <div className="section-spacer" />
    </>
  )
}
