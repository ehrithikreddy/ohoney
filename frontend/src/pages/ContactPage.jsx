import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: 'easeOut' }
})

const contactInfo = [
  {
    icon: <FiMail size={22} />,
    title: 'Email Us',
    value: 'ejpreddy@gmail.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:ejpreddy@gmail.com'
  },
  {
    icon: <FiPhone size={22} />,
    title: 'Call / WhatsApp',
    value: '+91 9346236425',
    sub: 'Mon–Sat, 9am–6pm IST',
    href: 'https://wa.me/919346236425'
  },
  {
    icon: <FiMapPin size={22} />,
    title: 'Based In',
    value: 'Hyderabad, Telangana',
    sub: 'Shipping across India',
    href: null
  },
]

const faqs = [
  { q: 'How long does delivery take?', a: '3–5 business days across India. Express delivery available in Hyderabad.' },
  { q: 'Is the honey truly raw and unfiltered?', a: 'Yes — never heated above 40°C, never ultra-filtered. What the bees make is what you get.' },
  { q: 'Do you offer bulk or wholesale pricing?', a: 'Yes! Use the Wholesale tab on this page or email us at wholesale@ohoney.in for pricing.' },
  { q: 'What if my jar arrives damaged?', a: 'We offer a full replacement or refund — no questions asked. Just send us a photo.' },
  { q: 'Do you ship internationally?', a: 'Currently India only. International shipping is on our roadmap for late 2026.' },
]

export default function ContactPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('contact')
  const [openFaq, setOpenFaq] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [wholesaleForm, setWholesaleForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    city: '', monthlyVolume: '', products: '', message: ''
  })
  const [errors, setErrors] = useState({})

  const handleContactChange = (e) => {
    setContactForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleWholesaleChange = (e) => {
    setWholesaleForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validateContact = () => {
    const e = {}
    if (!contactForm.name.trim()) e.name = 'Name is required'
    if (!contactForm.email.trim() || !/\S+@\S+\.\S+/.test(contactForm.email)) e.email = 'Valid email required'
    if (!contactForm.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateWholesale = () => {
    const e = {}
    if (!wholesaleForm.businessName.trim()) e.businessName = 'Business name is required'
    if (!wholesaleForm.contactName.trim()) e.contactName = 'Contact name is required'
    if (!wholesaleForm.email.trim() || !/\S+@\S+\.\S+/.test(wholesaleForm.email)) e.email = 'Valid email required'
    if (!wholesaleForm.phone.trim() || wholesaleForm.phone.length < 10) e.phone = 'Valid phone required'
    if (!wholesaleForm.city.trim()) e.city = 'City is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    if (!validateContact()) return
    toast.success('Message sent! We\'ll get back to you within 24 hours 🍯')
    setContactForm({ name: '', email: '', subject: '', message: '' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const handleWholesaleSubmit = (e) => {
    e.preventDefault()
    if (!validateWholesale()) return
    toast.success('Wholesale inquiry received! We\'ll contact you within 48 hours 🍯')
    setWholesaleForm({ businessName: '', contactName: '', email: '', phone: '', city: '', monthlyVolume: '', products: '', message: '' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const inputStyle = (name) => ({
    width: '100%', padding: '12px 16px',
    borderRadius: 12, fontSize: '0.95rem',
    border: errors[name] ? '2px solid #e53e3e' : '2px solid var(--cream)',
    background: 'var(--cream)', outline: 'none',
    transition: 'border 0.2s', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif'
  })

  return (
    <>
      <div style={{ paddingTop: 80, background: 'var(--cream)', minHeight: '100vh' }}>

        {/* Hero Banner */}
        <section style={{
          background: 'linear-gradient(135deg, var(--honey-pale) 0%, var(--cream) 100%)',
          padding: '64px 0 48px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(245,166,35,0.1)', top: -60, right: -60
          }} />
          <div className="container">
            <motion.div {...fadeUp(0.1)} style={{
              display: 'inline-block', background: 'rgba(245,166,35,0.15)',
              color: 'var(--honey-dark)', borderRadius: 50,
              padding: '6px 20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16
            }}>
              📬 Get in Touch
            </motion.div>
            <motion.h1 {...fadeUp(0.2)} style={{
              fontFamily: 'Playfair Display,serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--forest)', marginBottom: 16
            }}>
              We'd love to hear from you
            </motion.h1>
            <motion.p {...fadeUp(0.3)} style={{
              color: 'var(--muted)', fontSize: '1rem',
              maxWidth: 480, margin: '0 auto'
            }}>
              Whether you have a question about our honey, want to place a bulk order,
              or just want to say hello — we're here.
            </motion.p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section style={{ padding: '48px 0 0' }}>
          <div className="container">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48
            }} className="contact-cards-grid">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.title} {...fadeUp(i * 0.1)}
                  whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                  style={{
                    background: 'var(--white)', borderRadius: 20,
                    padding: 28, textAlign: 'center', boxShadow: 'var(--shadow)',
                    cursor: info.href ? 'pointer' : 'default',
                    transition: 'box-shadow 0.2s'
                  }}
                  onClick={() => info.href && window.open(info.href, '_blank')}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'var(--honey-pale)', color: 'var(--honey-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    {info.icon}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>{info.title}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{info.value}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{info.sub}</div>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4, marginBottom: 0,
              borderBottom: '2px solid #f0f0f0'
            }}>
              {[
                { id: 'contact', label: '✉️ Contact Us' },
                { id: 'wholesale', label: '🏪 Wholesale Inquiry' },
                { id: 'faq', label: '❓ FAQ' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSubmitted(false) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '14px 28px', fontWeight: 700, fontSize: '0.95rem',
                    color: activeTab === tab.id ? 'var(--honey-dark)' : 'var(--muted)',
                    borderBottom: activeTab === tab.id ? '3px solid var(--honey)' : '3px solid transparent',
                    marginBottom: -2, transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: 'var(--white)', borderRadius: '0 0 20px 20px', padding: 40, boxShadow: 'var(--shadow)', marginBottom: 60 }}>

              {/* ── Contact Form ── */}
              {activeTab === 'contact' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {submitted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ textAlign: 'center', padding: '60px 0' }}
                    >
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: '#d1e7dd', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px', color: '#0f5132'
                      }}>
                        <FiCheck size={32} />
                      </div>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', color: 'var(--forest)', marginBottom: 8 }}>Message Sent!</h3>
                      <p style={{ color: 'var(--muted)' }}>We'll get back to you within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="contact-form-grid">
                      <form onSubmit={handleContactSubmit}>
                        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: 'var(--forest)', marginBottom: 24 }}>
                          Send us a message
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {[
                            { name: 'name', label: 'Your Name', placeholder: 'Hrithik Reddy', type: 'text' },
                            { name: 'email', label: 'Email Address', placeholder: 'you@email.com', type: 'email' },
                            { name: 'subject', label: 'Subject (optional)', placeholder: 'Question about my order', type: 'text' },
                          ].map(f => (
                            <div key={f.name}>
                              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>{f.label}</label>
                              <input
                                type={f.type} name={f.name}
                                value={contactForm[f.name]}
                                onChange={handleContactChange}
                                placeholder={f.placeholder}
                                style={inputStyle(f.name)}
                                onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                                onBlur={e => e.target.style.borderColor = errors[f.name] ? '#e53e3e' : 'var(--cream)'}
                              />
                              {errors[f.name] && <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: 4 }}>{errors[f.name]}</div>}
                            </div>
                          ))}
                          <div>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>Message</label>
                            <textarea
                              name="message" rows={5}
                              value={contactForm.message}
                              onChange={handleContactChange}
                              placeholder="Tell us how we can help..."
                              style={{ ...inputStyle('message'), resize: 'vertical' }}
                              onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                              onBlur={e => e.target.style.borderColor = errors.message ? '#e53e3e' : 'var(--cream)'}
                            />
                            {errors.message && <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: 4 }}>{errors.message}</div>}
                          </div>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              background: 'var(--honey)', color: 'white',
                              border: 'none', borderRadius: 50, padding: '14px 32px',
                              fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content'
                            }}
                          >
                            <FiSend size={16} /> Send Message
                          </motion.button>
                        </div>
                      </form>

                      {/* WhatsApp CTA */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
                        <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: 'var(--forest)', fontWeight: 700 }}>
                          Prefer to chat directly?
                        </div>
                        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                          For quick questions, order updates, or just a conversation about honey — reach us on WhatsApp. We typically respond within minutes during business hours.
                        </p>
                        <motion.a
                          href="https://wa.me/919346236425"
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            background: '#25D366', color: 'white',
                            borderRadius: 50, padding: '14px 28px',
                            fontWeight: 700, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: 'fit-content', fontSize: '1rem',
                            boxShadow: '0 4px 14px rgba(37,211,102,0.35)'
                          }}
                        >
                          <span style={{ fontSize: '1.3rem' }}>💬</span> Chat on WhatsApp
                        </motion.a>
                        <div style={{
                          background: 'var(--honey-pale)', borderRadius: 16,
                          padding: 20, marginTop: 8
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>Business Hours</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.8 }}>
                            Monday – Saturday: 9:00 AM – 6:00 PM IST<br />
                            Sunday: 10:00 AM – 2:00 PM IST<br />
                            Public holidays: Closed
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Wholesale Form ── */}
              {activeTab === 'wholesale' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {submitted ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ textAlign: 'center', padding: '60px 0' }}
                    >
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: '#d1e7dd', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 20px', color: '#0f5132'
                      }}>
                        <FiCheck size={32} />
                      </div>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', color: 'var(--forest)', marginBottom: 8 }}>Inquiry Received!</h3>
                      <p style={{ color: 'var(--muted)' }}>Our wholesale team will reach out within 48 hours.</p>
                    </motion.div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: 'var(--forest)', marginBottom: 12 }}>
                          Wholesale & Bulk Orders
                        </h2>
                        <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: 600 }}>
                          We supply to retail stores, restaurants, hotels, and corporate gifting companies across India.
                          Minimum order: 10kg. Custom labelling available for orders above 50kg.
                        </p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
                          {['🏪 Retail Stores', '🍽️ Restaurants & Hotels', '🎁 Corporate Gifting', '🌿 Organic Brands'].map(tag => (
                            <span key={tag} style={{
                              background: 'var(--honey-pale)', color: 'var(--honey-dark)',
                              padding: '6px 16px', borderRadius: 50,
                              fontSize: '0.82rem', fontWeight: 600
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleWholesaleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="wholesale-form-grid">
                          {[
                            { name: 'businessName', label: 'Business Name', placeholder: 'ABC Organic Store', span: 2 },
                            { name: 'contactName', label: 'Contact Person', placeholder: 'Your full name' },
                            { name: 'email', label: 'Email Address', placeholder: 'business@email.com' },
                            { name: 'phone', label: 'Phone / WhatsApp', placeholder: '9876543210' },
                            { name: 'city', label: 'City & State', placeholder: 'Hyderabad, Telangana' },
                            { name: 'monthlyVolume', label: 'Estimated Monthly Volume', placeholder: 'e.g. 20kg, 50 jars', span: 1 },
                            { name: 'products', label: 'Products Interested In', placeholder: 'e.g. Wildflower, Forest Honey, Gift Packs', span: 1 },
                          ].map(f => (
                            <div key={f.name} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
                              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>{f.label}</label>
                              <input
                                type="text" name={f.name}
                                value={wholesaleForm[f.name]}
                                onChange={handleWholesaleChange}
                                placeholder={f.placeholder}
                                style={inputStyle(f.name)}
                                onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                                onBlur={e => e.target.style.borderColor = errors[f.name] ? '#e53e3e' : 'var(--cream)'}
                              />
                              {errors[f.name] && <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: 4 }}>{errors[f.name]}</div>}
                            </div>
                          ))}
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>Additional Notes</label>
                            <textarea
                              name="message" rows={4}
                              value={wholesaleForm.message}
                              onChange={handleWholesaleChange}
                              placeholder="Tell us more about your business and requirements..."
                              style={{ ...inputStyle('message'), resize: 'vertical' }}
                              onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                              onBlur={e => e.target.style.borderColor = 'var(--cream)'}
                            />
                          </div>
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            background: 'var(--honey)', color: 'white',
                            border: 'none', borderRadius: 50, padding: '14px 36px',
                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                            marginTop: 24, display: 'flex', alignItems: 'center', gap: 8
                          }}
                        >
                          <FiSend size={16} /> Submit Wholesale Inquiry
                        </motion.button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── FAQ ── */}
              {activeTab === 'faq' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: 'var(--forest)', marginBottom: 28 }}>
                    Frequently Asked Questions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
                    {faqs.map((faq, i) => (
                      <motion.div
                        key={i} layout
                        style={{
                          border: '2px solid',
                          borderColor: openFaq === i ? 'var(--honey)' : 'var(--cream)',
                          borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s'
                        }}
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          style={{
                            width: '100%', padding: '16px 20px',
                            background: openFaq === i ? 'var(--honey-pale)' : 'var(--white)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            textAlign: 'left', transition: 'background 0.2s'
                          }}
                        >
                          <span style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '0.95rem' }}>{faq.q}</span>
                          <motion.span
                            animate={{ rotate: openFaq === i ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ fontSize: '1.4rem', color: 'var(--honey)', flexShrink: 0, marginLeft: 12 }}
                          >+</motion.span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 20px 16px', color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.92rem' }}>
                            {faq.a}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  <div style={{ marginTop: 36, padding: 24, background: 'var(--honey-pale)', borderRadius: 16 }}>
                    <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 8 }}>Still have questions?</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                      Can't find what you're looking for? Reach out and we'll help right away.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveTab('contact')}
                      style={{
                        background: 'var(--honey)', color: 'white',
                        border: 'none', borderRadius: 50, padding: '10px 24px',
                        fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
                      }}
                    >
                      Contact Us →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
