import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const { title, shortDesc, price, originalPrice, tag, img } = product

  const tagColors = {
    'Best seller': { bg:'#fff3cd', color:'#856404' },
    'Organic':     { bg:'#d1e7dd', color:'#0f5132' },
    'Limited':     { bg:'#f8d7da', color:'#842029' },
    'Gift':        { bg:'#cff4fc', color:'#055160' },
  }
  const tagStyle = tagColors[tag] || { bg:'#e2e3e5', color:'#383d41' }

  return (
    <motion.article
      initial={{ opacity:0, y:30 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ duration:0.5 }}
      whileHover={{ y:-8 }}
      style={{
        background:'var(--white)', borderRadius:'var(--radius)',
        overflow:'hidden', boxShadow:'var(--shadow)',
        display:'flex', flexDirection:'column',
        cursor:'pointer'
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div style={{ position:'relative', overflow:'hidden', height:200 }}>
        <motion.img
          whileHover={{ scale:1.06 }}
          transition={{ duration:0.4 }}
          src={img} alt={title}
          loading="lazy"
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
        />
        <span style={{
          position:'absolute', top:12, right:12,
          background: tagStyle.bg, color: tagStyle.color,
          padding:'4px 12px', borderRadius:50,
          fontSize:'0.75rem', fontWeight:700
        }}>{tag}</span>
      </div>
      <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text)' }}>{title}</div>
        <div style={{ color:'var(--muted)', fontSize:'0.87rem', lineHeight:1.5, flex:1 }}>{shortDesc}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.3rem', color:'var(--forest)' }}>{price}</span>
            <span style={{ fontSize:'0.85rem', color:'var(--muted)', textDecoration:'line-through' }}>{originalPrice}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale:1.04, background:'var(--honey-dark)' }}
          whileTap={{ scale:0.96 }}
          onClick={(e) => { e.stopPropagation(); addItem(product) }}
          style={{
            background:'var(--honey)', color:'white',
            border:'none', borderRadius:50,
            padding:'10px 20px', fontWeight:700,
            cursor:'pointer', fontSize:'0.88rem',
            marginTop:8, transition:'background 0.2s'
          }}
        >
          Add to Cart 🍯
        </motion.button>
      </div>
    </motion.article>
  )
}
