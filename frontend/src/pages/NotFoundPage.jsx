import { Link } from 'react-router-dom'
import Seo from '../seo/Seo.jsx'

export default function NotFoundPage() {
  return (
    <div className="container state-page">
      <Seo title="Page not found" path="/404" noindex />
      <h1>We couldn’t find that page</h1>
      <p className="muted">The link may be out of date, or the address may have a typo.</p>
      <p>
        <Link to="/shop" className="btn btn--primary">Shop honey</Link>
      </p>
      <p className="muted">Or go to the <Link to="/">home page</Link>, or <Link to="/contact">contact us</Link>.</p>
    </div>
  )
}
