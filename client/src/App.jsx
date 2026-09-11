import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { pingAnalytics, initAnalyticsHeartbeat } from './services/analyticsTracker';
import { ThemeProvider } from './context/ThemeContext';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    pingAnalytics(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const cleanup = initAnalyticsHeartbeat();
    return cleanup;
  }, []);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

import { Toast } from './components/common/Toast';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GoToHomeBtn } from './components/layout/GoToHomeBtn';
import { WhatsAppFloatingBtn } from './components/layout/WhatsAppFloatingBtn';

import { Home } from './pages/Home';

// Route-level Code Splitting for Non-Initial Pages
const Shop = React.lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const Categories = React.lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = React.lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Wishlist = React.lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Orders = React.lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

const RouteLoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: '3px solid rgba(0, 163, 255, 0.2)',
      borderTopColor: 'var(--accent-primary, #00a3ff)',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <Toast />
              <AnalyticsTracker />
              <div className="cc-app-shell">
                <AnnouncementBar />
                <Navbar />
                <main className="cc-main-content">
                  <React.Suspense fallback={<RouteLoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Auth />} />
                      <Route path="/register" element={<Auth />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </React.Suspense>
                </main>
                <GoToHomeBtn />
                <Footer />
                <WhatsAppFloatingBtn />
              </div>
            </Router>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
