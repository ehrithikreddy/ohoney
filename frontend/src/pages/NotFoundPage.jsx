import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--cream)',
      padding: '24px', textAlign: 'center'
    }}>
      <div>
        {/* Animated honey jar */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '6rem', marginBottom: 8, display: 'block' }}
        >
          🍯
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div style={{
            fontFamily: 'Playfair Display,serif',
            fontSize: 'clamp(5rem, 15vw, 9rem)',
            fontWeight: 800, color: 'var(--honey)',
            lineHeight: 1, marginBottom: 8,
            textShadow: '0 4px 24px rgba(245,166,35,0.25)'
          }}>
            404
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: 'Playfair Display,serif',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            color: 'var(--forest)', marginBottom: 16
          }}
        >
          Oops! This page got lost in the hive.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            color: 'var(--muted)', fontSize: '1rem',
            maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.7
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to the good stuff.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(245,166,35,0.4)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/')}
            style={{
              background: 'var(--honey)', color: 'white',
              border: 'none', borderRadius: 50,
              padding: '14px 32px', fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245,166,35,0.35)'
            }}
          >
            🏠 Back to Home
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(245,166,35,0.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/#products')}
            style={{
              background: 'transparent', color: 'var(--honey-dark)',
              border: '2px solid var(--honey)', borderRadius: 50,
              padding: '14px 32px', fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            🍯 Shop Honey
          </motion.button>
        </motion.div>

        {/* Fun bee trail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 48, color: 'var(--muted)', fontSize: '0.85rem' }}
        >
          <motion.span
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-block', fontSize: '1.4rem' }}
          >
            🐝
          </motion.span>
          <span style={{ marginLeft: 8 }}>The bees are working hard — just not on this page.</span>
        </motion.div>
      </div>
    </div>
  )
}
