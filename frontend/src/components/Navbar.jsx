import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { count, setOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(253,246,227,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        padding: '16px 0',
      }}
    >
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <motion.div whileHover={{ scale: 1.05 }} style={{
          fontFamily:'Playfair Display, serif',
          fontWeight: 800, fontSize: '1.6rem',
          color: 'var(--forest)',
          letterSpacing: '-0.5px',
          cursor: 'pointer'
        }}>
          🍯 ohoney
        </motion.div>

        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['Products', 'About', 'Wholesale', 'Contact'].map(link => (
            <motion.a
              key={link}
              href={`#${link.toLowerCase()}`}
              whileHover={{ color: 'var(--honey-dark)' }}
              style={{
                textDecoration: 'none', color: 'var(--text)',
                fontWeight: 500, fontSize: '0.95rem',
                transition: 'color 0.2s'
              }}
            >
              {link}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            style={{
              background: 'var(--honey)', border: 'none',
              borderRadius: '50px', padding: '10px 20px',
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.9rem', color: 'var(--white)',
              boxShadow: '0 4px 14px rgba(245,166,35,0.4)'
            }}
          >
            <FiShoppingCart size={16} />
            Cart {count > 0 && <span style={{
              background: 'var(--forest)', color: 'white',
              borderRadius: '50%', width: 20, height: 20,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: '0.75rem'
            }}>{count}</span>}
          </motion.button>
        </nav>
      </div>
    </motion.header>
  )
}
