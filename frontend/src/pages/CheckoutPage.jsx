import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' }
})

const steps = [
  { id: 1, label: 'Cart Review', icon: <FiPackage /> },
  { id: 2, label: 'Delivery Details', icon: <FiMapPin /> },
  { id: 3, label: 'Order Summary', icon: <FiCreditCard /> },
]

const DELIVERY_FEE = 60
const FREE_DELIVERY_THRESHOLD = 499

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, updateQty, removeItem, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})

  const deliveryFee = total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const grandTotal = total + deliveryFee

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required'
    if (!form.phone.trim() || form.phone.length < 10) newErrors.phone = 'Valid phone number is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (!form.pincode.trim() || form.pincode.length !== 6) newErrors.pincode = 'Valid 6-digit pincode is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully! 🍯 We\'ll contact you shortly.', { duration: 4000 })
    clearCart()
    setTimeout(() => navigate('/'), 2000)
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div style={{ textAlign: 'center', padding: '140px 24px', background: 'var(--cream)', minHeight: '100vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</div>
        <h2 style={{ fontFamily: 'Playfair Display,serif', color: 'var(--forest)', marginBottom: 12 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 28 }}>Add some honey before checking out!</p>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/')}
          style={{
            background: 'var(--honey)', color: 'white', border: 'none',
            borderRadius: 50, padding: '14px 32px', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer'
          }}>
          Browse Products →
        </motion.button>
      </div>
    )
  }

  return (
    <>
      <div style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--cream)' }}>
        <div className="container" style={{ padding: '40px 24px', maxWidth: 960 }}>

          {/* Back button */}
          <motion.button
            {...fadeUp(0)}
            whileHover={{ x: -4 }}
            onClick={() => step === 1 ? navigate('/') : setStep(s => s - 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--forest)', fontWeight: 600, fontSize: '0.95rem',
              marginBottom: 32, padding: 0
            }}
          >
            <FiArrowLeft size={18} />
            {step === 1 ? 'Back to Shopping' : 'Back'}
          </motion.button>

          {/* Step Indicator */}
          <motion.div {...fadeUp(0.1)} style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: 40, gap: 0
          }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <motion.div
                    animate={{
                      background: step >= s.id ? 'var(--honey)' : 'var(--cream)',
                      color: step >= s.id ? 'white' : 'var(--muted)',
                      boxShadow: step === s.id ? '0 4px 14px rgba(245,166,35,0.4)' : 'none'
                    }}
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '1rem',
                      border: '2px solid',
                      borderColor: step >= s.id ? 'var(--honey)' : '#e0e0e0',
                      transition: 'all 0.3s'
                    }}
                  >
                    {step > s.id ? <FiCheck size={18} /> : s.icon}
                  </motion.div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: step >= s.id ? 'var(--honey-dark)' : 'var(--muted)'
                  }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    height: 2, width: 80, marginBottom: 24,
                    background: step > s.id ? 'var(--honey)' : '#e0e0e0',
                    transition: 'background 0.3s'
                  }} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Cart Review ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }} className="checkout-grid">

                  {/* Cart Items */}
                  <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)' }}>
                    <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: 'var(--forest)', marginBottom: 24 }}>
                      Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </h2>
                    {items.map(item => (
                      <motion.div key={item.id} layout
                        style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--cream)', alignItems: 'center' }}
                      >
                        <img src={item.img} alt={item.title}
                          style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{item.title}</div>
                          <div style={{ color: 'var(--honey-dark)', fontWeight: 700 }}>{item.price}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => updateQty(item.id, -1)}
                            style={{ background: 'var(--cream)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                            −
                          </motion.button>
                          <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => updateQty(item.id, 1)}
                            style={{ background: 'var(--cream)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
                            +
                          </motion.button>
                        </div>
                        <div style={{ fontWeight: 800, fontFamily: 'Playfair Display,serif', fontSize: '1.1rem', color: 'var(--forest)', minWidth: 60, textAlign: 'right' }}>
                          ₹{parseInt(item.price.replace('₹', '')) * item.qty}
                        </div>
                        <motion.button whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          style={{ background: '#fff0f0', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#e53e3e', fontSize: '1rem' }}>
                          ×
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary Card */}
                  <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)', height: 'fit-content' }}>
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 20 }}>
                      Order Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        <span>Subtotal</span><span style={{ fontWeight: 600, color: 'var(--text)' }}>₹{total}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        <span>Delivery</span>
                        <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#0f5132' : 'var(--text)' }}>
                          {deliveryFee === 0 ? '🎉 Free' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      {deliveryFee > 0 && (
                        <div style={{ background: 'var(--honey-pale)', borderRadius: 10, padding: '8px 12px', fontSize: '0.8rem', color: 'var(--honey-dark)', fontWeight: 600 }}>
                          Add ₹{FREE_DELIVERY_THRESHOLD - total} more for free delivery!
                        </div>
                      )}
                      <div style={{ borderTop: '2px solid var(--cream)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest)' }}>₹{grandTotal}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(2)}
                      style={{
                        width: '100%', background: 'var(--honey)', color: 'white',
                        border: 'none', borderRadius: 50, padding: '14px',
                        fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
                      }}
                    >
                      Continue to Delivery →
                    </motion.button>
                    <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--muted)', fontSize: '0.8rem' }}>
                      🔒 Secure checkout
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Delivery Details ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }} className="checkout-grid">

                  {/* Form */}
                  <div style={{ background: 'var(--white)', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)' }}>
                    <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.4rem', color: 'var(--forest)', marginBottom: 24 }}>
                      Delivery Details
                    </h2>

                    {/* Personal Info */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 16, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Personal Information
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Hrithik Reddy', span: 2 },
                          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@email.com' },
                          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210' },
                        ].map(field => (
                          <div key={field.name} style={{ gridColumn: field.span ? `span ${field.span}` : 'span 1' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              name={field.name}
                              value={form[field.name]}
                              onChange={handleFormChange}
                              placeholder={field.placeholder}
                              style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 12, fontSize: '0.95rem',
                                border: errors[field.name] ? '2px solid #e53e3e' : '2px solid var(--cream)',
                                background: 'var(--cream)', outline: 'none',
                                transition: 'border 0.2s', boxSizing: 'border-box'
                              }}
                              onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                              onBlur={e => e.target.style.borderColor = errors[field.name] ? '#e53e3e' : 'var(--cream)'}
                            />
                            {errors[field.name] && (
                              <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: 4 }}>{errors[field.name]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 16, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Delivery Address
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                          { name: 'address', label: 'Street Address', placeholder: 'House no, Street, Area', span: 2 },
                          { name: 'city', label: 'City', placeholder: 'Hyderabad' },
                          { name: 'state', label: 'State', placeholder: 'Telangana' },
                          { name: 'pincode', label: 'Pincode', placeholder: '500001' },
                          { name: 'notes', label: 'Delivery Notes (optional)', placeholder: 'Leave at door, call before delivery...' },
                        ].map(field => (
                          <div key={field.name} style={{ gridColumn: field.span ? `span ${field.span}` : 'span 1' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 6 }}>
                              {field.label}
                            </label>
                            <input
                              type="text"
                              name={field.name}
                              value={form[field.name]}
                              onChange={handleFormChange}
                              placeholder={field.placeholder}
                              style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 12, fontSize: '0.95rem',
                                border: errors[field.name] ? '2px solid #e53e3e' : '2px solid var(--cream)',
                                background: 'var(--cream)', outline: 'none',
                                transition: 'border 0.2s', boxSizing: 'border-box'
                              }}
                              onFocus={e => e.target.style.borderColor = 'var(--honey)'}
                              onBlur={e => e.target.style.borderColor = errors[field.name] ? '#e53e3e' : 'var(--cream)'}
                            />
                            {errors[field.name] && (
                              <div style={{ color: '#e53e3e', fontSize: '0.78rem', marginTop: 4 }}>{errors[field.name]}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Sidebar */}
                  <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)', height: 'fit-content' }}>
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 20 }}>
                      Order Summary
                    </h3>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem' }}>
                        <span style={{ color: 'var(--muted)' }}>{item.title} × {item.qty}</span>
                        <span style={{ fontWeight: 600 }}>₹{parseInt(item.price.replace('₹', '')) * item.qty}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '2px solid var(--cream)', paddingTop: 12, marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem', color: 'var(--muted)' }}>
                        <span>Delivery</span>
                        <span style={{ color: deliveryFee === 0 ? '#0f5132' : 'var(--text)', fontWeight: 600 }}>
                          {deliveryFee === 0 ? 'Free 🎉' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--forest)' }}>₹{grandTotal}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { if (validateForm()) setStep(3) }}
                      style={{
                        width: '100%', background: 'var(--honey)', color: 'white',
                        border: 'none', borderRadius: 50, padding: '14px',
                        fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 20
                      }}
                    >
                      Review Order →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Order Summary & Place Order ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }} className="checkout-grid">

                  {/* Review */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Items */}
                    <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)' }}>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 20 }}>
                        🛍️ Items Ordered
                      </h3>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--cream)', alignItems: 'center' }}>
                          <img src={item.img} alt={item.title} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.title}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Qty: {item.qty}</div>
                          </div>
                          <div style={{ fontWeight: 800, fontFamily: 'Playfair Display,serif', color: 'var(--forest)' }}>
                            ₹{parseInt(item.price.replace('₹', '')) * item.qty}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)' }}>
                      <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 16 }}>
                        📍 Delivery Address
                      </h3>
                      <div style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                        <div style={{ fontWeight: 700 }}>{form.name}</div>
                        <div style={{ color: 'var(--muted)' }}>{form.phone} · {form.email}</div>
                        <div style={{ marginTop: 8 }}>{form.address}</div>
                        <div>{form.city}, {form.state} — {form.pincode}</div>
                        {form.notes && <div style={{ marginTop: 8, color: 'var(--muted)', fontStyle: 'italic' }}>Note: {form.notes}</div>}
                      </div>
                      <motion.button
                        whileHover={{ color: 'var(--honey-dark)' }}
                        onClick={() => setStep(2)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--honey)', fontWeight: 600, fontSize: '0.85rem', padding: 0, marginTop: 12 }}
                      >
                        Edit Address →
                      </motion.button>
                    </div>
                  </div>

                  {/* Final Payment Card */}
                  <div style={{ background: 'var(--white)', borderRadius: 20, padding: 28, boxShadow: 'var(--shadow)', height: 'fit-content' }}>
                    <h3 style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 20 }}>
                      Payment
                    </h3>

                    {/* COD Badge */}
                    <div style={{
                      background: 'var(--honey-pale)', border: '2px solid var(--honey)',
                      borderRadius: 14, padding: '14px 18px', marginBottom: 20,
                      display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <span style={{ fontSize: '1.6rem' }}>💵</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '0.95rem' }}>Cash on Delivery</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Pay when your order arrives</div>
                      </div>
                    </div>

                    {/* Razorpay coming soon */}
                    <div style={{
                      background: 'var(--cream)', borderRadius: 14, padding: '14px 18px',
                      marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
                      opacity: 0.6
                    }}>
                      <span style={{ fontSize: '1.6rem' }}>💳</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>UPI / Card / Net Banking</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Coming soon via Razorpay</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--muted)' }}>
                        <span>Subtotal</span><span style={{ fontWeight: 600, color: 'var(--text)' }}>₹{total}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--muted)' }}>
                        <span>Delivery</span>
                        <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#0f5132' : 'var(--text)' }}>
                          {deliveryFee === 0 ? 'Free 🎉' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      <div style={{ borderTop: '2px solid var(--cream)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>Total</span>
                        <span style={{ fontFamily: 'Playfair Display,serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--forest)' }}>₹{grandTotal}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(245,166,35,0.45)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePlaceOrder}
                      style={{
                        width: '100%', background: 'var(--honey)', color: 'white',
                        border: 'none', borderRadius: 50, padding: '16px',
                        fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(245,166,35,0.35)'
                      }}
                    >
                      🍯 Place Order — ₹{grandTotal}
                    </motion.button>
                    <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--muted)', fontSize: '0.78rem' }}>
                      🔒 Your information is safe with us
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </>
  )
}
