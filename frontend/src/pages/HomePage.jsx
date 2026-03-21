import React from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import ProductGrid from '../components/ProductGrid'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <section id="products" style={{ padding:'80px 0', background:'var(--white)' }}>
        <div className="container">
          <h2 style={{ textAlign:'center', fontSize:'2.2rem', marginBottom:8 }}>Our Honey Collection</h2>
          <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:48 }}>
            Small-batch, raw and unfiltered. Harvested with care.
          </p>
          <ProductGrid />
        </div>
      </section>
      <Footer />
    </>
  )
}
