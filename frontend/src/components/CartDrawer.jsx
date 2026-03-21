import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { open, setOpen, items, removeItem, updateQty, total } = useCart()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setOpen(false)}
            style={{
              position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
              zIndex:200, backdropFilter:'blur(4px)'
            }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', stiffness:320, damping:35 }}
            style={{
              position:'fixed', top:0, right:0, bottom:0,
              width: 'min(420px, 100vw)',
              background:'var(--white)', zIndex:201,
              boxShadow:'-8px 0 40px rgba(0,0,0,0.12)',
              display:'flex', flexDirection:'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding:'24px', borderBottom:'1px solid #f0f0f0',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <h2 style={{fontSize:'1.3rem'}}>Your Cart 🍯</h2>
              <motion.button
                whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                onClick={() => setOpen(false)}
                style={{background:'none', border:'none', cursor:'pointer', padding:8}}
              >
                <FiX size={22} />
              </motion.button>
            </div>

            {/* Items */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
              {items.length === 0 ? (
                <div style={{textAlign:'center', color:'var(--muted)', marginTop:60}}>
                  <div style={{fontSize:'3rem', marginBottom:16}}>🍯</div>
                  <p>Your cart is empty.</p>
                  <p style={{fontSize:'0.9rem', marginTop:8}}>Add some honey to get started!</p>
                </div>
              ) : items.map(item => (
                <motion.div
                  key={item.id} layout
                  initial={{opacity:0, x:20}} animate={{opacity:1, x:0}}
                  exit={{opacity:0, x:20}}
                  style={{
                    display:'flex', gap:12, alignItems:'center',
                    padding:'12px 0', borderBottom:'1px solid #f5f5f5'
                  }}
                >
                  <img src={item.img} alt={item.title}
                    style={{width:60, height:60, objectFit:'cover', borderRadius:10}} />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:'0.9rem'}}>{item.title}</div>
                    <div style={{color:'var(--honey-dark)', fontWeight:700, marginTop:4}}>{item.price}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <motion.button whileTap={{scale:0.9}}
                      onClick={() => updateQty(item.id, -1)}
                      style={{background:'#f5f5f5', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                    ><FiMinus size={13} /></motion.button>
                    <span style={{fontWeight:600, minWidth:20, textAlign:'center'}}>{item.qty}</span>
                    <motion.button whileTap={{scale:0.9}}
                      onClick={() => updateQty(item.id, 1)}
                      style={{background:'#f5f5f5', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}
                    ><FiPlus size={13} /></motion.button>
                    <motion.button whileTap={{scale:0.9}}
                      onClick={() => removeItem(item.id)}
                      style={{background:'#fff0f0', border:'none', borderRadius:6, width:28, height:28, cursor:'pointer', color:'#e53e3e', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:4}}
                    ><FiTrash2 size={13} /></motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{padding:'20px 24px', borderTop:'1px solid #f0f0f0'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:16}}>
                  <span style={{fontWeight:600}}>Total</span>
                  <span style={{fontFamily:'Playfair Display,serif', fontWeight:800, fontSize:'1.3rem', color:'var(--forest)'}}>₹{total}</span>
                </div>
                <motion.button
                  whileHover={{scale:1.02, boxShadow:'0 8px 24px rgba(245,166,35,0.4)'}}
                  whileTap={{scale:0.98}}
                  onClick={() => { setOpen(false); navigate('/checkout') }}
                  style={{
                    width:'100%', background:'var(--honey)', color:'white',
                    border:'none', borderRadius:50, padding:'14px',
                    fontWeight:700, fontSize:'1rem', cursor:'pointer'
                  }}
                >
                  Proceed to Checkout →
                </motion.button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
