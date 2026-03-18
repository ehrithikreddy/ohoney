import React from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import ProductGrid from './components/ProductGrid'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <section id="products" style={{padding:'80px 0', background:'var(--white)'}}>
          <div className="container">
            <h2 style={{textAlign:'center', fontSize:'2.2rem', marginBottom:'8px'}}>Our Honey Collection</h2>
            <p style={{textAlign:'center', color:'var(--muted)', marginBottom:'48px'}}>
              Small-batch, raw and unfiltered. Harvested with care.
            </p>
            <ProductGrid />
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
