import { Link } from 'react-router-dom'
import { site, whatsappLink } from '../content/site.js'
import Seo from '../seo/Seo.jsx'
import EnquiryForm from '../components/EnquiryForm.jsx'
import Icon from '../components/Icon.jsx'
import './ContactPage.css'

export default function ContactPage() {
  return (
    <>
      <Seo title="Contact us" path="/contact" description="Questions about an order or our honey? Email, call or WhatsApp ohoney in Hyderabad, or send us a message." />
      <div className="container page-head">
        <h1>Contact us</h1>
        <p className="lede">Questions about an order, a honey or a gift? Message us, call, or write below. We’re based in {site.basedIn}.</p>
      </div>

      <div className="container contact">
        <section className="contact__ways" aria-labelledby="ways-title">
          <h2 id="ways-title" className="visually-hidden">Ways to reach us</h2>
          <dl className="contact__list">
            <div>
              <dt>WhatsApp</dt>
              <dd><a href={whatsappLink()} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> {site.phoneDisplay}<span className="visually-hidden"> (opens in a new tab)</span></a></dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd><a href={site.phoneHref}>{site.phoneDisplay}</a></dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{site.hours.map(([days, time]) => <span key={days} className="contact__hours">{days}: {time}</span>)}</dd>
            </div>
          </dl>
          <p className="muted">Looking for delivery times or our returns policy? Try the <Link to="/faq">FAQ</Link>. Buying for a business? Use the <Link to="/wholesale">wholesale enquiry form</Link>.</p>
        </section>

        <section className="contact__form" aria-labelledby="form-title">
          <h2 id="form-title">Send a message</h2>
          <EnquiryForm type="contact" />
        </section>
      </div>
      <div className="section-spacer" />
    </>
  )
}
