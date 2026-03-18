import React from 'react'
import ProductCard from './ProductCard'

const products = [
  {id:'p1', title:'Wildflower Honey 500g', desc:'Light and floral. Great for daily use.', price:'₹399', tag:'Best seller', img:''},
  {id:'p2', title:'Forest Honey 250g', desc:'Dark, robust and mineral-rich.', price:'₹299', tag:'Organic', img:''},
  {id:'p3', title:'Eucalyptus Honey 300g', desc:'Distinct aroma and high antioxidants.', price:'₹349', tag:'Limited', img:''},
  {id:'p4', title:'Honey Sampler Pack', desc:'Three 100g jars — try them all!', price:'₹499', tag:'Gift', img:''},
]

export default function ProductGrid() {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px,1fr))', gap:28
    }}>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
