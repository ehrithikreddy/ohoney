import { useLocation } from 'react-router-dom'
import { whatsappLink } from '../content/site.js'
import Icon from './Icon.jsx'
import './WhatsAppLink.css'

// A quiet floating shortcut to WhatsApp. Hidden on checkout so it never covers the order button.
export default function WhatsAppLink() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/checkout')) return null
  return (
    <aside aria-label="Chat with us">
      <a className="whatsapp-link" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" size={28} />
        <span className="visually-hidden">Chat with us on WhatsApp (opens in a new tab)</span>
      </a>
    </aside>
  )
}
