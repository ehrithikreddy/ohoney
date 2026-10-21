import { Link } from 'react-router-dom'
import { faqGroups } from '../content/faq.js'
import Seo from '../seo/Seo.jsx'
import { Paragraphs } from '../components/RichText.jsx'
import { slug } from '../lib/slug.js'
import './FaqPage.css'

export default function FaqPage() {
  return (
    <>
      <Seo title="FAQ" path="/faq" description="Delivery, payment, storing raw honey, crystallisation, damaged jars and wholesale: answers to common questions about ohoney." />
      <div className="container container--narrow page-head">
        <h1>Questions and answers</h1>
        <p className="lede">Can’t find your answer? <Link to="/contact">Contact us</Link>.</p>
      </div>
      <div className="container container--narrow faq">
        {faqGroups.map((group) => (
          <section key={group.heading} aria-labelledby={`faq-${slug(group.heading)}`}>
            <h2 id={`faq-${slug(group.heading)}`}>{group.heading}</h2>
            {group.items.map((item) => (
              <details key={item.q} className="faq__item">
                <summary>{item.q}</summary>
                <div className="faq__answer"><Paragraphs body={item.a} /></div>
              </details>
            ))}
          </section>
        ))}
      </div>
      <div className="section-spacer" />
    </>
  )
}
