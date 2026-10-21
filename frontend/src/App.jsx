import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { findByLegacyId } from '@ohoney/shared/catalog.js'
import { CartProvider } from './context/CartContext.jsx'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import WholesalePage from './pages/WholesalePage.jsx'
import FaqPage from './pages/FaqPage.jsx'
import PolicyPage from './pages/PolicyPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderConfirmedPage from './pages/OrderConfirmedPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Old product URLs (/product/p1) from the first version of the site.
function LegacyProductRedirect() {
  const { id } = useParams()
  const product = findByLegacyId(id)
  return <Navigate to={product ? `/shop/${product.slug}` : '/shop'} replace />
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:slug" element={<ProductPage />} />
          <Route path="product/:id" element={<LegacyProductRedirect />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="wholesale" element={<WholesalePage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="shipping" element={<PolicyPage name="shipping" />} />
          <Route path="returns" element={<PolicyPage name="returns" />} />
          <Route path="privacy" element={<PolicyPage name="privacy" />} />
          <Route path="terms" element={<PolicyPage name="terms" />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/confirmed" element={<OrderConfirmedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}
