import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { count, setOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['Products', 'About', 'Wholesale', 'Contact']

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled || menuOpen ? 'rgba(253,246,227,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.3s ease',
          padding: '16px 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 800, fontSize: '1.6rem',
            color: 'var(--forest)', cursor: 'pointer'
          }}>
            🍯 ohoney
          </motion.div>

          {/* Desktop Nav */}
          <nav className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {links.map(link => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                whileHover={{ color: 'var(--honey-dark)' }}
                style={{
                  textDecoration: 'none', color: 'var(--text)',
                  fontWeight: 500, fontSize: '0.95rem',
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
              Cart {count > 0 && (
                <span style={{
                  background: 'var(--forest)', color: 'white',
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>{count}</span>
              )}
            </motion.button>
          </nav>

          {/* Mobile Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Cart icon always visible on mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(true)}
              className="nav-hamburger"
              style={{
                display: 'none', background: 'var(--honey)',
                border: 'none', borderRadius: '50%',
                width: 40, height: 40, cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', position: 'relative'
              }}
            >
              <FiShoppingCart size={18} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: 'var(--forest)', color: 'white',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700
                }}>{count}</span>
              )}
            </motion.button>

            {/* Hamburger button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(prev => !prev)}
              className="nav-hamburger"
              style={{
                display: 'none', background: 'none',
                border: '2px solid var(--honey)', borderRadius: 10,
                width: 40, height: 40, cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--forest)'
              }}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0,
              background: 'rgba(253,246,227,0.98)',
              backdropFilter: 'blur(12px)',
              zIndex: 99, padding: '16px 24px 24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              borderTop: '1px solid rgba(245,166,35,0.2)'
            }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'block', padding: '14px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  textDecoration: 'none', color: 'var(--text)',
                  fontWeight: 600, fontSize: '1.05rem'
                }}
              >
                {link}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
