import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Show button after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000)
    // Show tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 4000)
    }, 5000)
    return () => { clearTimeout(timer); clearTimeout(tooltipTimer) }
  }, [])

  const phoneNumber = '919346236425' // Replace with your actual number
  const message = encodeURIComponent('Hi! I have a question about ohoney 🍯')
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <AnimatePresence>
      {visible && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28,
          zIndex: 300, display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', gap: 10
        }}>

          {/* Tooltip bubble */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: 'white', borderRadius: 16,
                  padding: '10px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                  fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)',
                  whiteSpace: 'nowrap', border: '1px solid #f0f0f0'
                }}
              >
                💬 Chat with us on WhatsApp!
                {/* Tail */}
                <div style={{
                  position: 'absolute', bottom: -6, right: 20,
                  width: 12, height: 12, background: 'white',
                  transform: 'rotate(45deg)',
                  borderRight: '1px solid #f0f0f0',
                  borderBottom: '1px solid #f0f0f0'
                }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
              textDecoration: 'none', position: 'relative'
            }}
          >
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'rgba(37,211,102,0.4)'
              }}
            />
            {/* WhatsApp SVG icon */}
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.822.784 5.457 2.146 7.7L2 30l6.494-2.104A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="white"/>
              <path d="M23.5 20.5c-.3.8-1.5 1.5-2.4 1.7-.6.1-1.4.2-4.1-.9-3.4-1.3-5.6-4.8-5.8-5-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.8.3-.3.7-.4 1-.4h.7c.3 0 .6.1.9.7l1.2 2.8c.1.2.1.5 0 .7l-.6.8c-.1.1-.2.3-.1.5.4.7 1 1.5 1.7 2.1.8.7 1.6 1.1 2.1 1.3.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.3.7-.2l2.7 1.3c.3.1.5.3.5.6v.3z" fill="#25D366"/>
            </svg>
          </motion.a>
        </div>
      )}
    </AnimatePresence>
  )
}
