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
import { Shop } from './pages/Shop';
import { Categories } from './pages/Categories';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { Orders } from './pages/Orders';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Router>
              <Toast />
              <AnalyticsTracker />
              <div className="cc-app-shell">
                <AnnouncementBar />
                <Navbar />
                <main className="cc-main-content">
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
