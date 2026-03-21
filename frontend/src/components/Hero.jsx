import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' }
})

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--honey-pale) 0%, var(--cream) 60%, #e8f4ea 100%)',
      display: 'flex', alignItems: 'center', paddingTop: '80px',
      overflow: 'hidden', position: 'relative'
    }}>
      {/* Background blobs */}
      <div style={{
        position:'absolute', width:400, height:400, borderRadius:'50%',
        background:'rgba(245,166,35,0.12)', top:-80, right:-100, zIndex:0
      }}/>
      <div style={{
        position:'absolute', width:250, height:250, borderRadius:'50%',
        background:'rgba(82,121,111,0.08)', bottom:50, left:-60, zIndex:0
      }}/>

      <div className="container hero-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '60px', alignItems: 'center', position:'relative', zIndex:1
      }}>
        <div>
          <motion.div {...fadeUp(0.1)} style={{
            display:'inline-block', background:'rgba(245,166,35,0.15)',
            color:'var(--honey-dark)', borderRadius:'50px',
            padding:'6px 16px', fontSize:'0.85rem', fontWeight:600,
            marginBottom:20, letterSpacing:'0.5px'
          }}>
            🌿 100% Raw & Natural
          </motion.div>

          <motion.h1 {...fadeUp(0.2)} style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            lineHeight: 1.15, marginBottom: 24,
            color: 'var(--forest)'
          }}>
            Taste the sweetness<br/>
            <span style={{color:'var(--honey)'}}>of nature</span> —<br/>
            bottled with care.
          </motion.h1>

          <motion.p {...fadeUp(0.35)} style={{
            fontSize: '1.15rem', color: 'var(--muted)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 460
          }}>
            Small-batch, raw and unfiltered honey delivered to your door.
            Sustainable apiaries, transparent sourcing, zero compromises.
          </motion.p>

          <motion.div {...fadeUp(0.5)} className="hero-actions" style={{ display:'flex', gap:16 }}>
            <motion.a
              href="#products"
              whileHover={{ scale: 1.04, boxShadow:'0 8px 24px rgba(245,166,35,0.45)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: 'var(--honey)', color: 'white',
                padding: '14px 32px', borderRadius: '50px',
                fontWeight: 700, textDecoration:'none', fontSize:'1rem',
                boxShadow:'0 4px 14px rgba(245,166,35,0.35)', display:'inline-block'
              }}
            >
              Shop Now →
            </motion.a>
            <motion.a
              onClick={() => navigate('/about')}
              whileHover={{ background: 'rgba(245,166,35,0.1)' }}
              style={{
                border: '2px solid var(--honey)', color: 'var(--honey-dark)',
                padding: '14px 32px', borderRadius: '50px',
                fontWeight: 600, textDecoration:'none', fontSize:'1rem',
                display:'inline-block', transition:'background 0.2s', cursor:'pointer'
              }}
            >
              Our Story
            </motion.a>
          </motion.div>

          <motion.div {...fadeUp(0.65)} className="hero-stats" style={{
            display:'flex', gap:32, marginTop:48
          }}>
            {[['500+','Happy customers'],['8+','Honey varieties'],['100%','Natural & raw']].map(([num, label]) => (
              <div key={label}>
                <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.6rem', fontWeight:800, color:'var(--forest)'}}>{num}</div>
                <div style={{fontSize:'0.8rem', color:'var(--muted)', fontWeight:500}}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Animated Honey Jar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          style={{ display:'flex', justifyContent:'center', alignItems:'center' }}
        >
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 260, height: 320,
              background: 'linear-gradient(160deg, #ffd166 0%, #f5a623 50%, #d4881a 100%)',
              borderRadius: '40px 40px 60px 60px',
              boxShadow: '0 20px 60px rgba(245,166,35,0.35), inset 0 2px 8px rgba(255,255,255,0.4)',
              display: 'flex', flexDirection:'column',
              alignItems: 'center', justifyContent:'center',
              position: 'relative', overflow:'hidden'
            }}
          >
            {/* Label */}
            <div style={{
              background:'rgba(255,255,255,0.92)', borderRadius:16,
              padding:'12px 24px', textAlign:'center',
              boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{fontFamily:'Playfair Display,serif', fontWeight:800, color:'var(--forest)', fontSize:'1.2rem'}}>ohoney</div>
              <div style={{fontSize:'0.7rem', color:'var(--muted)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase'}}>Raw · Pure · Natural</div>
            </div>
            {/* Honey drip effect */}
            <motion.div
              animate={{ scaleY: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position:'absolute', bottom:0, left:'50%',
                transform:'translateX(-50%)',
                width:40, height:60,
                background:'rgba(255,255,255,0.15)',
                borderRadius:'0 0 40px 40px'
              }}
            />
            {/* Lid */}
            <div style={{
              position:'absolute', top:-12, left:'50%',
              transform:'translateX(-50%)',
              width:100, height:24,
              background:'var(--forest)', borderRadius:8
            }}/>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
