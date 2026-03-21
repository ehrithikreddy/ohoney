import React from 'react'
import ProductCard from './ProductCard'
import products from '../data/products'

export default function ProductGrid() {
  return (
    <div className="products-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))',
      gap: 28
    }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
