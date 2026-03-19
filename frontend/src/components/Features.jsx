import React from 'react'
import { motion } from 'framer-motion'

const features = [
  { icon:'🐝', title:'Pure & Raw', desc:'Never heated above 40°C, preserving all natural enzymes and nutrients.' },
  { icon:'🌿', title:'Sustainably Sourced', desc:'Our beekeepers follow ethical, eco-friendly harvesting practices.' },
  { icon:'🚚', title:'Free Delivery', desc:'Free shipping on all orders above ₹499 across India.' },
  { icon:'✅', title:'Lab Tested', desc:'Every batch is tested for purity. No additives, no sugar syrups.' },
]

export default function Features() {
  return (
    <section style={{ padding:'64px 0', background:'var(--cream)' }}>
      <div className="container features-grid" style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24
      }}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity:0, y:30 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.5, delay: i * 0.1 }}
            whileHover={{ y:-6, boxShadow:'0 12px 32px rgba(0,0,0,0.1)' }}
            style={{
              background:'var(--white)', borderRadius:'var(--radius)',
              padding:28, textAlign:'center',
              boxShadow:'var(--shadow)', cursor:'default',
              transition:'box-shadow 0.2s'
            }}
          >
            <div style={{ fontSize:'2.2rem', marginBottom:12 }}>{f.icon}</div>
            <div style={{ fontWeight:700, marginBottom:8, fontSize:'1rem', color:'var(--forest)' }}>{f.title}</div>
            <div style={{ color:'var(--muted)', fontSize:'0.88rem', lineHeight:1.6 }}>{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
