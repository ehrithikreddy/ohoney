import { products } from '@ohoney/shared/catalog.js'
import Seo from '../seo/Seo.jsx'
import EnquiryForm from '../components/EnquiryForm.jsx'
import './ContactPage.css'

export default function WholesalePage() {
  return (
    <>
      <Seo
        title="Wholesale and gifting"
        path="/wholesale"
        description="Raw honey for shops, restaurants, hotels and corporate gifting across India. Send ohoney a wholesale enquiry for prices."
      />
      <div className="container page-head">
        <h1>Wholesale and gifting</h1>
        <p className="lede">We supply shops, restaurants, hotels and corporate gifting companies across India. Tell us what you need and we’ll send prices.</p>
      </div>

      <div className="container contact">
        <section className="contact__ways" aria-labelledby="supply-title">
          <h2 id="supply-title" className="visually-hidden">What we supply</h2>
          <dl className="contact__list">
            <div>
              <dt>Honeys</dt>
              <dd>{products.filter((p) => p.colour).map((p) => p.name).join(', ')}</dd>
            </div>
            <div>
              <dt>Minimum order</dt>
              <dd>10 kg</dd>
            </div>
            <div>
              <dt>Custom labels</dt>
              <dd>On orders above 50 kg</dd>
            </div>
          </dl>
        </section>

        <section className="contact__form" aria-labelledby="wholesale-form-title">
          <h2 id="wholesale-form-title">Wholesale enquiry</h2>
          <EnquiryForm type="wholesale" />
        </section>
      </div>
      <div className="section-spacer" />
    </>
  )
}
