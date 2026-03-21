import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import products from '../data/products'
import Footer from '../components/Footer'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const product = products.find(p => p.id === id)
  const [selectedImg, setSelectedImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  if (!product) return (
    <div style={{ textAlign:'center', padding:'120px 24px' }}>
      <div style={{ fontSize:'3rem' }}>🍯</div>
      <h2 style={{ marginTop:16 }}>Product not found</h2>
      <button onClick={() => navigate('/')} style={{
        marginTop:24, background:'var(--honey)', color:'white',
        border:'none', borderRadius:50, padding:'12px 28px',
        fontWeight:700, cursor:'pointer', fontSize:'1rem'
      }}>Back to Home</button>
    </div>
  )

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product)
  }

  const tagColors = {
    'Best seller': { bg:'#fff3cd', color:'#856404' },
    'Organic':     { bg:'#d1e7dd', color:'#0f5132' },
    'Limited':     { bg:'#f8d7da', color:'#842029' },
    'Gift':        { bg:'#cff4fc', color:'#055160' },
  }
  const tagStyle = tagColors[product.tag] || { bg:'#e2e3e5', color:'#383d41' }

  return (
    <>
      <div style={{ paddingTop:80, minHeight:'100vh', background:'var(--cream)' }}>
        <div className="container" style={{ padding:'40px 24px' }}>

          {/* Back button */}
          <motion.button
            initial={{ opacity:0, x:-20 }}
            animate={{ opacity:1, x:0 }}
            whileHover={{ x:-4 }}
            onClick={() => navigate('/')}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'none', border:'none', cursor:'pointer',
              color:'var(--forest)', fontWeight:600, fontSize:'0.95rem',
              marginBottom:32, padding:0
            }}
          >
            <FiArrowLeft size={18} /> Back to Products
          </motion.button>

          {/* Main product layout */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:60, alignItems:'start',
            background:'var(--white)', borderRadius:24,
            padding:40, boxShadow:'var(--shadow)'
          }} className="product-detail-grid">

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity:0, x:-30 }}
              animate={{ opacity:1, x:0 }}
              transition={{ duration:0.6 }}
            >
              <div style={{
                borderRadius:20, overflow:'hidden',
                height:400, marginBottom:16
              }}>
                <motion.img
                  key={selectedImg}
                  initial={{ opacity:0, scale:1.05 }}
                  animate={{ opacity:1, scale:1 }}
                  transition={{ duration:0.35 }}
                  src={product.gallery[selectedImg]}
                  alt={product.title}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}
                />
              </div>
              {/* Thumbnail row */}
              <div style={{ display:'flex', gap:12 }}>
                {product.gallery.map((img, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale:1.05 }}
                    whileTap={{ scale:0.95 }}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width:80, height:80, borderRadius:12,
                      overflow:'hidden', cursor:'pointer',
                      border: selectedImg === i ? '3px solid var(--honey)' : '3px solid transparent',
                      transition:'border 0.2s'
                    }}
                  >
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity:0, x:30 }}
              animate={{ opacity:1, x:0 }}
              transition={{ duration:0.6 }}
            >
              {/* Tag + origin */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <span style={{
                  background: tagStyle.bg, color: tagStyle.color,
                  padding:'4px 14px', borderRadius:50,
                  fontSize:'0.8rem', fontWeight:700
                }}>{product.tag}</span>
                <span style={{ color:'var(--muted)', fontSize:'0.85rem' }}>📍 {product.origin}</span>
              </div>

              <h1 style={{
                fontFamily:'Playfair Display,serif',
                fontSize:'2rem', marginBottom:12,
                color:'var(--forest)', lineHeight:1.2
              }}>{product.title}</h1>

              <p style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:24, fontSize:'0.95rem' }}>
                {product.shortDesc}
              </p>

              {/* Price */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <span style={{
                  fontFamily:'Playfair Display,serif',
                  fontSize:'2.2rem', fontWeight:800, color:'var(--forest)'
                }}>{product.price}</span>
                <span style={{
                  fontSize:'1.1rem', color:'var(--muted)',
                  textDecoration:'line-through'
                }}>{product.originalPrice}</span>
                <span style={{
                  background:'#d1e7dd', color:'#0f5132',
                  padding:'4px 12px', borderRadius:50,
                  fontSize:'0.8rem', fontWeight:700
                }}>
                  Save {Math.round((1 - parseInt(product.price.replace('₹','')) / parseInt(product.originalPrice.replace('₹',''))) * 100)}%
                </span>
              </div>

              {/* Benefits */}
              <div style={{ marginBottom:28 }}>
                <div style={{ fontWeight:700, marginBottom:12, color:'var(--text)' }}>Why you'll love it</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {product.benefits.map(b => (
                    <span key={b} style={{
                      background:'var(--honey-pale)', color:'var(--honey-dark)',
                      padding:'6px 14px', borderRadius:50,
                      fontSize:'0.82rem', fontWeight:600
                    }}>✓ {b}</span>
                  ))}
                </div>
              </div>

              {/* Quantity selector */}
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
                <div style={{ fontWeight:600, color:'var(--text)' }}>Quantity</div>
                <div style={{
                  display:'flex', alignItems:'center', gap:12,
                  background:'var(--cream)', borderRadius:50, padding:'6px 16px'
                }}>
                  <motion.button whileTap={{ scale:0.9 }}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--text)' }}
                  ><FiMinus size={16} /></motion.button>
                  <span style={{ fontWeight:700, minWidth:24, textAlign:'center', fontSize:'1rem' }}>{qty}</span>
                  <motion.button whileTap={{ scale:0.9 }}
                    onClick={() => setQty(q => q + 1)}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--text)' }}
                  ><FiPlus size={16} /></motion.button>
                </div>
                <span style={{ color:'var(--muted)', fontSize:'0.85rem' }}>Weight: {product.weight}</span>
              </div>

              {/* Add to cart button */}
              <motion.button
                whileHover={{ scale:1.03, boxShadow:'0 8px 24px rgba(245,166,35,0.4)' }}
                whileTap={{ scale:0.97 }}
                onClick={handleAddToCart}
                style={{
                  width:'100%', background:'var(--honey)', color:'white',
                  border:'none', borderRadius:50, padding:'16px',
                  fontWeight:700, fontSize:'1.05rem', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  gap:10, boxShadow:'0 4px 14px rgba(245,166,35,0.35)'
                }}
              >
                <FiShoppingCart size={20} />
                Add {qty > 1 ? `${qty} items` : 'to Cart'} — ₹{parseInt(product.price.replace('₹','')) * qty}
              </motion.button>

              {/* Trust badges */}
              <div style={{
                display:'flex', gap:16, marginTop:20,
                padding:16, background:'var(--cream)',
                borderRadius:16, justifyContent:'center'
              }}>
                {['🚚 Free delivery above ₹499', '✅ Lab tested', '🔄 Easy returns'].map(badge => (
                  <span key={badge} style={{ fontSize:'0.78rem', color:'var(--muted)', fontWeight:600 }}>{badge}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs — Description & Nutrition */}
          <div style={{
            background:'var(--white)', borderRadius:24,
            padding:40, boxShadow:'var(--shadow)', marginTop:24
          }}>
            {/* Tab buttons */}
            <div style={{ display:'flex', gap:4, marginBottom:28, borderBottom:'2px solid var(--cream)', paddingBottom:0 }}>
              {['description', 'nutrition'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background:'none', border:'none', cursor:'pointer',
                    padding:'12px 24px', fontWeight:700, fontSize:'0.95rem',
                    color: activeTab === tab ? 'var(--honey-dark)' : 'var(--muted)',
                    borderBottom: activeTab === tab ? '3px solid var(--honey)' : '3px solid transparent',
                    marginBottom:-2, transition:'all 0.2s',
                    textTransform:'capitalize'
                  }}
                >
                  {tab === 'description' ? '📖 Description' : '🥗 Nutrition'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.3 }}
            >
              {activeTab === 'description' ? (
                <p style={{ color:'var(--text)', lineHeight:1.9, fontSize:'1rem', maxWidth:700 }}>
                  {product.fullDesc}
                </p>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, maxWidth:600 }}>
                  {Object.entries(product.nutrition).map(([key, val]) => (
                    <div key={key} style={{
                      background:'var(--cream)', borderRadius:16,
                      padding:20, textAlign:'center'
                    }}>
                      <div style={{ fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.3rem', color:'var(--forest)' }}>{val}</div>
                      <div style={{ color:'var(--muted)', fontSize:'0.8rem', fontWeight:600, textTransform:'capitalize', marginTop:4 }}>{key}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
