import { useCart } from '../context/cart-context.js'

export default function AddToCartButton({ product, qty = 1, className = '', children }) {
  const { add } = useCart()
  if (!product.available) {
    return (
      <button type="button" className={`btn btn--secondary ${className}`} disabled>
        Currently unavailable
      </button>
    )
  }
  return (
    <button type="button" className={`btn btn--primary ${className}`} onClick={() => add(product.sku, qty)}>
      {children ?? 'Add to cart'}
      {!children && <span className="visually-hidden">: {product.name} {product.size}</span>}
    </button>
  )
}
