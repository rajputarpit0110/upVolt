import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, deleteProduct } from '../services/productService';
import { fetchAllOrders, updateOrderStatus } from '../services/orderService';
import { fetchAuditLogs, fetchAdminStats, resetPassword, fetchLiveAnalytics, resetLiveAnalytics } from '../services/adminService';
import { fetchMentors, deleteMentor } from '../services/mentorService';
import { fetchCoupons, deleteCoupon } from '../services/couponService';
import { fetchReels, deleteReel } from '../services/reelService';
import { fetchDeliverySettings, updateDeliverySettings, fetchStatsSettings, updateStatsSettings, DEFAULT_STATS } from '../services/settingsService';
import { API_BASE_URL, safeJson } from '../config/api';
import { renderStatIcon } from '../components/home/StatsBar';
import { AddProductModal } from '../components/product/AddProductModal';
import { EditProductModal } from '../components/product/EditProductModal';
import { AddMentorModal } from '../components/admin/AddMentorModal';
import { EditMentorModal } from '../components/admin/EditMentorModal';
import { AddCouponModal } from '../components/admin/AddCouponModal';
import { AddReelModal } from '../components/admin/AddReelModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { WhatsAppIcon, LinkedInIcon, InstagramIcon, GitHubIcon } from '../components/common/SocialIcons';
import { Badge } from '../components/common/Badge';
import {
  Film,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Package,
  ShoppingCart,
  FileText,
  KeyRound,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
  UserCheck,
  Filter,
  Eye,
  ExternalLink,
  GraduationCap,
  Tag,
  Calendar,
  Percent,
  Lock,
  LogOut,
  Loader2,
  Activity,
  Globe,
  MapPin,
  Users,
  Smartphone,
  Monitor,
  Radio,
  Compass,
  Heart,
  Star,
  Award,
  Edit
} from 'lucide-react';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user, token, isAdmin, isMasterAdmin, login, logout } = useAuth();
  const navigate = useNavigate();

  // Dedicated Admin Login State
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'products';
  const initialModal = searchParams.get('modal');

  const [activeTab, setActiveTab] = useState(initialTab);

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialModal === 'addProduct');
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Mentors state
  const [mentors, setMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [mentorSearch, setMentorSearch] = useState('');
  const [isAddMentorModalOpen, setIsAddMentorModalOpen] = useState(initialModal === 'addMentor');
  const [isEditMentorModalOpen, setIsEditMentorModalOpen] = useState(false);
  const [mentorToEdit, setMentorToEdit] = useState(null);
  const [mentorToDelete, setMentorToDelete] = useState(null);
  const [deleteMentorLoading, setDeleteMentorLoading] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(initialModal === 'addCoupon');
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleteCouponLoading, setDeleteCouponLoading] = useState(false);

  // Reels state
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [reelSearch, setReelSearch] = useState('');
  const [isAddReelModalOpen, setIsAddReelModalOpen] = useState(initialModal === 'addReel');
  const [reelToDelete, setReelToDelete] = useState(null);
  const [deleteReelLoading, setDeleteReelLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Audit Logs state (Visible to all 3 Admins)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAdminFilter, setAuditAdminFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');

  // Live Analytics & Rough Location state (Visible to all 3 Admins)
  const [liveAnalytics, setLiveAnalytics] = useState({
    liveUsersCount: 0,
    totalVisitorsCount: 0,
    totalPageViews: 0,
    recentVisitors: [],
    topLocations: [],
    deviceStats: { Desktop: 0, Mobile: 0, Tablet: 0 }
  });
  const [liveLoading, setLiveLoading] = useState(false);
  const [resettingLive, setResettingLive] = useState(false);

  // Stats state
  const [stats, setStats] = useState(null);

  // Password reset state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Status message
  const [actionNotice, setActionNotice] = useState({ type: '', text: '' });

  // Delivery Pricing & Speed Settings state
  const [deliverySettings, setDeliverySettings] = useState({
    normalDeliveryFee: 40,
    fastDeliveryFee: 99,
    freeDeliveryThreshold: 499,
    normalDeliveryNote: 'Standard Delivery (2-3 Days across Delhi)',
    fastDeliveryNote: 'Express Superfast Delivery (Within 24 Hours)'
  });
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliveryNotice, setDeliveryNotice] = useState({ type: '', text: '' });

  // Load delivery settings
  const loadDeliverySettings = async () => {
    setDeliveryLoading(true);
    try {
      const data = await fetchDeliverySettings();
      if (data) {
        setDeliverySettings(data);
      }
    } catch (err) {
      console.warn('Failed to load delivery settings:', err);
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Save delivery settings
  const handleSaveDeliverySettings = async (e) => {
    e.preventDefault();
    setDeliverySaving(true);
    setDeliveryNotice({ type: '', text: '' });

    try {
      const updated = await updateDeliverySettings({
        normalDeliveryFee: Number(deliverySettings.normalDeliveryFee),
        fastDeliveryFee: Number(deliverySettings.fastDeliveryFee),
        freeDeliveryThreshold: Number(deliverySettings.freeDeliveryThreshold),
        normalDeliveryNote: deliverySettings.normalDeliveryNote,
        fastDeliveryNote: deliverySettings.fastDeliveryNote
      });
      setDeliverySettings(updated);
      setDeliveryNotice({
        type: 'success',
        text: '✅ Delivery charges updated successfully! Students will now see these delivery rates on both Online & COD checkout.'
      });
    } catch (err) {
      setDeliveryNotice({
        type: 'error',
        text: err.message || 'Failed to update delivery settings.'
      });
    } finally {
      setDeliverySaving(false);
    }
  };

  // Homepage Stats state
  const [homepageStats, setHomepageStats] = useState(DEFAULT_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsNotice, setStatsNotice] = useState({ type: '', text: '' });

  const loadStatsSettings = async () => {
    setStatsLoading(true);
    try {
      const data = await fetchStatsSettings();
      if (data && Array.isArray(data) && data.length > 0) {
        setHomepageStats(data);
      }
    } catch (err) {
      console.warn('Failed to load stats settings:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveStatsSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatsSaving(true);
    setStatsNotice({ type: '', text: '' });

    try {
      const updated = await updateStatsSettings(homepageStats);
      setHomepageStats(updated);
      setStatsNotice({
        type: 'success',
        text: '✅ Homepage stats updated successfully! Students and visitors will now see these updated metrics on the live homepage.'
      });
      loadAuditLogs();
    } catch (err) {
      setStatsNotice({
        type: 'error',
        text: err.message || 'Failed to update homepage stats.'
      });
    } finally {
      setStatsSaving(false);
    }
  };

  const handleStatFieldChange = (index, field, value) => {
    setHomepageStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddStatCard = () => {
    if (homepageStats.length >= 6) {
      setStatsNotice({
        type: 'error',
        text: 'Maximum 6 stat cards allowed to maintain a clean layout.'
      });
      return;
    }
    setHomepageStats((prev) => [
      ...prev,
      {
        id: `stat-${Date.now()}`,
        icon: 'users',
        number: '100+',
        label: 'New Trust Metric'
      }
    ]);
  };

  const handleRemoveStatCard = (index) => {
    if (homepageStats.length <= 1) {
      setStatsNotice({
        type: 'error',
        text: 'At least 1 stat card must be kept.'
      });
      return;
    }
    setHomepageStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetDefaultStats = () => {
    setHomepageStats(DEFAULT_STATS);
    setStatsNotice({
      type: 'success',
      text: 'Values reset to defaults. Click "Save All Homepage Stats" to apply to live site.'
    });
  };

  // Load products
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const { products: fetched } = await fetchProducts();
      setProducts(fetched || []);
    } catch (err) {
      console.warn('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const fetched = await fetchAllOrders(orderStatusFilter, orderSearch);
      setOrders(fetched || []);
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load mentors
  const loadMentors = async () => {
    setMentorsLoading(true);
    try {
      const res = await fetchMentors();
      setMentors(res.mentors || []);
    } catch (err) {
      console.warn('Failed to load mentors:', err);
    } finally {
      setMentorsLoading(false);
    }
  };

  // Load coupons
  const loadCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetchCoupons();
      setCoupons(res.coupons || []);
    } catch (err) {
      console.warn('Failed to load coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  // Load maker reels
  const loadReels = async () => {
    setReelsLoading(true);
    try {
      const res = await fetchReels();
      setReels(res.reels || []);
    } catch (err) {
      console.warn('Failed to load reels:', err);
    } finally {
      setReelsLoading(false);
    }
  };

  // Load audit logs (All 3 Admins)
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Load live analytics & rough locations (All 3 Admins)
  const loadLiveAnalytics = async () => {
    try {
      const data = await fetchLiveAnalytics();
      if (data) {
        setLiveAnalytics(data);
      }
    } catch (err) {
      console.warn('Failed to load live analytics:', err);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleResetAnalytics = async () => {
    if (!window.confirm('Reset all tracked test visitor data? Real counter will restart from 0.')) {
      return;
    }
    try {
      setResettingLive(true);
      await resetLiveAnalytics();
      setActionNotice({ type: 'success', text: 'All visitor telemetry reset. Real counter restarted from 0.' });
      await loadLiveAnalytics();
    } catch (err) {
      console.error('Failed to reset analytics:', err);
      setActionNotice({ type: 'error', text: 'Failed to reset analytics.' });
    } finally {
      setResettingLive(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadOrders();
      loadMentors();
      loadCoupons();
      loadReels();
      loadStats();
      loadAuditLogs();
      loadLiveAnalytics();

      const liveInterval = setInterval(() => {
        loadLiveAnalytics();
      }, 10000);

      return () => clearInterval(liveInterval);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'orders') {
      loadOrders();
    }
    if (isAdmin && activeTab === 'mentors') {
      loadMentors();
    }
    if (isAdmin && activeTab === 'coupons') {
      loadCoupons();
    }
    if (isAdmin && activeTab === 'reels') {
      loadReels();
    }
    if (isAdmin && activeTab === 'delivery') {
      loadDeliverySettings();
    }
    if (isAdmin && activeTab === 'stats') {
      loadStatsSettings();
    }
  }, [orderStatusFilter, activeTab]);

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);

    try {
      await deleteProduct(productToDelete._id || productToDelete.sku);
      setActionNotice({
        type: 'success',
        text: `Component "${productToDelete.name}" removed successfully.`
      });
      setProductToDelete(null);
      loadProducts();
      loadStats();
      loadAuditLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to remove component.'
      });
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDeleteMentor = async () => {
    if (!mentorToDelete) return;
    setDeleteMentorLoading(true);

    try {
      await deleteMentor(mentorToDelete._id || mentorToDelete.id);
      setActionNotice({
        type: 'success',
        text: `Mentor "${mentorToDelete.name}" removed successfully.`
      });
      setMentorToDelete(null);
      loadMentors();
      loadAuditLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to remove mentor.'
      });
      throw err;
    } finally {
      setDeleteMentorLoading(false);
    }
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setDeleteCouponLoading(true);

    try {
      await deleteCoupon(couponToDelete._id || couponToDelete.code);
      setActionNotice({
        type: 'success',
        text: `Coupon "${couponToDelete.code}" deleted successfully.`
      });
      setCouponToDelete(null);
      loadCoupons();
      loadAuditLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to delete coupon.'
      });
      throw err;
    } finally {
      setDeleteCouponLoading(false);
    }
  };

  const handleConfirmDeleteReel = async () => {
    if (!reelToDelete) return;
    setDeleteReelLoading(true);

    try {
      await deleteReel(reelToDelete._id || reelToDelete.id, token);
      setActionNotice({
        type: 'success',
        text: `Reel "${reelToDelete.title}" deleted successfully.`
      });
      setReelToDelete(null);
      loadReels();
      loadAuditLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to delete reel.'
      });
      throw err;
    } finally {
      setDeleteReelLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, `Updated by ${user?.name} via Admin Portal`);
      setActionNotice({
        type: 'success',
        text: `Order #${orderId} status changed to "${newStatus.toUpperCase()}"`
      });
      loadOrders();
      loadStats();
      loadAuditLogs();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to update order status.'
      });
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setPwMessage({ type: '', text: '' });

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPwLoading(true);
    try {
      await resetPassword(pwForm.currentPassword, pwForm.newPassword);
      setPwMessage({ type: 'success', text: 'Password reset and updated successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      loadAuditLogs();
    } catch (err) {
      setPwMessage({ type: 'error', text: err.message || 'Failed to reset password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminLoginForm.username.trim(),
          password: adminLoginForm.password
        })
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid admin credentials');
      }

      if (data.user.role !== 'admin' && data.user.role !== 'master_admin') {
        throw new Error('Access Denied: This account does not have administrator privileges.');
      }

      login(data.user, data.token);
      setAdminLoginForm({ username: '', password: '' });
      setActionNotice({ type: 'success', text: `Welcome back, ${data.user.name}!` });
    } catch (err) {
      setAdminLoginError(err.message || 'Authentication failed. Please check your admin username and password.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    logout();
    navigate('/admin');
  };

  if (!isAdmin) {
    return (
      <div className="cc-page cc-admin-auth-page">
        <div className="container" style={{ maxWidth: 480, padding: '60px 16px 100px' }}>
          <div className="glass-panel cc-admin-auth-card">
            <div className="cc-admin-auth-header">
              <div className="cc-admin-auth-icon-circle">
                <ShieldCheck size={38} />
              </div>
              <h2 className="cc-admin-auth-title">Admin Authentication</h2>
              <p className="cc-admin-auth-subtitle">
                Access is strictly restricted to verified upVolt administrators.
              </p>
            </div>

            {adminLoginError && (
              <div className="cc-admin-auth-error">
                <AlertCircle size={18} />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="cc-admin-auth-form">
              <div className="cc-form-group">
                <label className="cc-form-label">Admin Username or Email</label>
                <div className="cc-input-wrap">
                  <KeyRound size={18} className="cc-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., admin1, admin2, or masteradmin"
                    value={adminLoginForm.username}
                    onChange={(e) => setAdminLoginForm({ ...adminLoginForm, username: e.target.value })}
                    className="cc-input cc-input--with-icon"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="cc-form-group">
                <label className="cc-form-label">Admin Password</label>
                <div className="cc-input-wrap">
                  <Lock size={18} className="cc-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your admin password"
                    value={adminLoginForm.password}
                    onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                    className="cc-input cc-input--with-icon"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="cc-btn cc-btn--primary cc-admin-login-submit"
                disabled={adminLoginLoading}
              >
                {adminLoginLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Authenticate & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="cc-admin-auth-footer">
              <Link to="/" className="cc-admin-auth-back-link">
                &larr; Return to upVolt Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const filteredMentors = mentors.filter(m => {
    if (!mentorSearch.trim()) return true;
    const q = mentorSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.college.toLowerCase().includes(q) ||
      (m.specialties && m.specialties.some(s => s.toLowerCase().includes(q)))
    );
  });

  const filteredCoupons = coupons.filter(c => {
    if (!couponSearch.trim()) return true;
    const q = couponSearch.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const filteredReels = reels.filter(r => {
    if (!reelSearch.trim()) return true;
    const q = reelSearch.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.difficulty && r.difficulty.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.components && r.components.some(c => c.toLowerCase().includes(q)))
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditAdminFilter !== 'all') {
      const matchUsername = log.adminUsername === auditAdminFilter;
      const matchEmail = log.adminEmail && log.adminEmail.toLowerCase().includes(auditAdminFilter.toLowerCase());
      const matchName = log.adminName && log.adminName.toLowerCase().includes(auditAdminFilter.toLowerCase());
      if (!matchUsername && !matchEmail && !matchName) return false;
    }
    if (auditActionFilter !== 'all' && log.action !== auditActionFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="cc-page cc-admin-page">
      <div className="container">
        {/* Top Header */}
        <div className="cc-admin-header">
          <div className="cc-admin-header__left">
            <div className="cc-admin-role-badge">
              <ShieldCheck size={16} />
              <span>{isMasterAdmin ? 'System Administrator' : 'Hardware Admin'}</span>
            </div>
            <h1 className="cc-admin-title">upVolt Admin Portal</h1>
            <p className="cc-admin-subtitle">
              Welcome, <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          <div className="cc-admin-header__actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="cc-btn cc-btn--outline"
              onClick={() => setIsAddCouponModalOpen(true)}
            >
              <Tag size={16} />
              <span>Create Coupon</span>
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--outline"
              onClick={() => setIsAddMentorModalOpen(true)}
            >
              <GraduationCap size={16} />
              <span>Add Mentor</span>
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Component</span>
            </button>
            <button
              type="button"
              className="cc-btn cc-btn--outline cc-admin-signout-btn"
              onClick={handleAdminLogout}
              title="Lock Admin Portal & Sign Out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global Notice */}
        {actionNotice.text && (
          <div className={`cc-admin-notice cc-admin-notice--${actionNotice.type}`}>
            {actionNotice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{actionNotice.text}</span>
            <button type="button" onClick={() => setActionNotice({ type: '', text: '' })}>
              &times;
            </button>
          </div>
        )}

        {/* Quick KPI Stats Bar with Live Traffic Telemetry */}
        <div className="cc-admin-stats-grid">
          {/* Live Active Users Radar Card */}
          <div className="glass-panel cc-admin-stat-card cc-admin-stat-card--live">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="cc-admin-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} color="#10B981" />
                Live Users Online
              </span>
              <span className="cc-live-pulse-badge">
                <span className="cc-pulse-dot" />
                LIVE RADAR
              </span>
            </div>
            <span className="cc-admin-stat-value" style={{ color: '#10B981' }}>
              {liveAnalytics?.liveUsersCount ?? 0}
            </span>
            <span className="cc-admin-stat-sub">
              Active browsing now
            </span>
          </div>

          {/* Total Unique Visitors & Rough Location */}
          <div className="glass-panel cc-admin-stat-card">
            <span className="cc-admin-stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} color="var(--accent-cyan)" />
              Total Website Visitors
            </span>
            <span className="cc-admin-stat-value" style={{ color: 'var(--text-primary)' }}>
              {liveAnalytics?.totalVisitorsCount ?? 0}
            </span>
            <span className="cc-admin-stat-sub">
              {liveAnalytics?.topLocations?.[0] ? `Top Hub: ${liveAnalytics.topLocations[0].location}` : 'No visits recorded yet'}
            </span>
          </div>

          {stats && (
            <>
              <div className="glass-panel cc-admin-stat-card">
                <span className="cc-admin-stat-label">Total Components</span>
                <span className="cc-admin-stat-value">{stats.totalProducts}</span>
                <span className="cc-admin-stat-sub">In live catalog</span>
              </div>
              <div className="glass-panel cc-admin-stat-card">
                <span className="cc-admin-stat-label">Total Orders</span>
                <span className="cc-admin-stat-value">{stats.totalOrders}</span>
                <span className="cc-admin-stat-sub">{stats.pendingOrders} pending processing</span>
              </div>
              <div className="glass-panel cc-admin-stat-card">
                <span className="cc-admin-stat-label">Revenue Handled</span>
                <span className="cc-admin-stat-value" style={{ color: '#10B981' }}>₹{stats.totalRevenue}</span>
                <span className="cc-admin-stat-sub">Completed orders</span>
              </div>
            </>
          )}
        </div>

        {/* Main Tabs Navigation */}
        <div className="cc-admin-tabs">
          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'products' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={17} />
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'liveTraffic' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('liveTraffic');
              loadLiveAnalytics();
            }}
          >
            <Activity size={17} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Live Visitors & Locations
              <span className="cc-tab-live-count">{liveAnalytics?.liveUsersCount ?? 0}</span>
            </span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'mentors' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('mentors')}
          >
            <GraduationCap size={17} />
            <span>Mentors ({mentors.length})</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'coupons' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Tag size={17} />
            <span>Coupons ({coupons.length})</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'reels' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('reels');
              loadReels();
            }}
          >
            <Film size={17} />
            <span>Reels ({reels.length})</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'orders' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={17} />
            <span>Orders Management</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'delivery' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('delivery');
              loadDeliverySettings();
            }}
          >
            <Truck size={17} />
            <span>Delivery Charges</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'stats' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('stats');
              loadStatsSettings();
            }}
          >
            <Activity size={17} />
            <span>Homepage Stats</span>
          </button>

          {/* Activity Audit Logs - Accessible to all 3 Administrators */}
          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'audit' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => {
              setActiveTab('audit');
              loadAuditLogs();
            }}
          >
            <FileText size={17} />
            <span>Activity Audit Logs</span>
          </button>

          <button
            type="button"
            className={`cc-admin-tab-btn ${activeTab === 'security' ? 'cc-admin-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <KeyRound size={17} />
            <span>Admin Password Reset</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div className="cc-search-box" style={{ maxWidth: 360 }}>
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="cc-search-input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={loadProducts}
                  disabled={productsLoading}
                  style={{ padding: '8px 14px' }}
                >
                  <RefreshCw size={15} className={productsLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary"
                  onClick={() => setIsAddModalOpen(true)}
                  style={{ padding: '8px 16px' }}
                >
                  <Plus size={15} />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            <div className="glass-panel cc-admin-table-container">
              <table className="cc-admin-table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Images</th>
                    <th>SKU</th>
                    <th>Added By</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const multiCount = p.images?.length || 1;
                    return (
                      <tr key={p._id || p.sku}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={p.image || (p.images && p.images[0]) || '/images/realistic/arduino_uno.jpg'}
                              alt={p.name}
                              style={{ width: 36, height: 36, objectFit: 'contain', background: 'var(--bg-surface)', padding: 4, borderRadius: 6 }}
                            />
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{p.name}</strong>
                              {p.badge && <Badge variant={p.badge.toLowerCase()}>{p.badge}</Badge>}
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <strong>₹{p.price}</strong>
                          {p.originalPrice && <del style={{ marginLeft: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{p.originalPrice}</del>}
                        </td>
                        <td>
                          <span className="cc-img-count-badge">
                            {multiCount} {multiCount === 1 ? 'image' : 'images'}
                          </span>
                        </td>
                        <td><code>{p.sku}</code></td>
                        <td>
                          <div className="cc-admin-badge-pill">
                            <span className="cc-admin-tag-user">
                              {p.addedByUsername ? `@${p.addedByUsername}` : (p.addedByName?.toLowerCase().includes('admin 1') ? '@admin1' : p.addedByName?.toLowerCase().includes('admin 2') ? '@admin2' : '@masteradmin')}
                            </span>
                            <span className="cc-admin-tag-sub">
                              {p.addedByName || 'upVolt Admin'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            <Link
                              to={`/product/${p._id || p.sku}`}
                              className="cc-action-sm-btn"
                              title="View on site"
                              target="_blank"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              type="button"
                              className="cc-action-sm-btn"
                              onClick={() => { setProductToEdit(p); setIsEditProductModalOpen(true); }}
                              title="Edit component"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"                              
                              className="cc-action-sm-btn cc-action-sm-btn--danger"
                              onClick={() => handleDeleteProduct(p)}
                              title="Delete component"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MENTORS MANAGEMENT */}
        {activeTab === 'mentors' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div className="cc-search-box" style={{ maxWidth: 360 }}>
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  placeholder="Search mentors by name..."
                  value={mentorSearch}
                  onChange={(e) => setMentorSearch(e.target.value)}
                  className="cc-search-input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--outline cc-btn--sm"
                  onClick={loadMentors}
                  disabled={mentorsLoading}
                  title="Reload mentors"
                >
                  <RefreshCw size={14} className={mentorsLoading ? 'cc-spinner' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary cc-btn--sm"
                  onClick={() => setIsAddMentorModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Add Mentor</span>
                </button>
              </div>
            </div>

            <div className="glass-panel cc-admin-table-card">
              <div className="cc-table-wrapper">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>Mentor</th>
                      <th>Description</th>
                      <th>Direct Connections</th>
                      <th>Added By</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorsLoading ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0' }}>
                          Loading mentors from database...
                        </td>
                      </tr>
                    ) : filteredMentors.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          No mentors match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMentors.map((m) => (
                        <tr key={m._id || m.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem' }}>
                              {m.name}
                              <CheckCircle size={14} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                          </td>
                          <td>
                            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.5 }}>
                              {m.bio || m.description}
                            </p>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              {m.socialLinks?.whatsapp && (
                                <a
                                  href={m.socialLinks.whatsapp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Connection"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: '#25D366',
                                    background: 'rgba(37, 211, 102, 0.12)',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                  }}
                                >
                                  <WhatsAppIcon size={15} />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              {m.socialLinks?.linkedin && (
                                <a
                                  href={m.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="LinkedIn Connection"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    color: '#0A66C2',
                                    background: 'rgba(10, 102, 194, 0.12)',
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    textDecoration: 'none'
                                  }}
                                >
                                  <LinkedInIcon size={15} />
                                  <span>LinkedIn</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="cc-admin-badge-pill">
                              <span className="cc-admin-tag-user">
                                {m.addedByUsername ? `@${m.addedByUsername}` : '@masteradmin'}
                              </span>
                              <span className="cc-admin-tag-sub">
                                {m.addedByName || 'upVolt Core'}
                              </span>
                            </div>
                          </td>
                          <td style={{ minWidth: 150, textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                className="cc-table-action-edit"
                                onClick={() => { setMentorToEdit(m); setIsEditMentorModalOpen(true); }}
                                title="Edit mentor"
                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="cc-table-action-delete"
                                onClick={() => setMentorToDelete(m)}
                                title="Delete mentor (requires confirmation)"
                              >
                                <Trash2 size={13} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div className="cc-search-box" style={{ maxWidth: 360 }}>
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  placeholder="Search coupons by code or description..."
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                  className="cc-search-input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--outline cc-btn--sm"
                  onClick={loadCoupons}
                  disabled={couponsLoading}
                  title="Reload coupons"
                >
                  <RefreshCw size={14} className={couponsLoading ? 'cc-spinner' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary cc-btn--sm"
                  onClick={() => setIsAddCouponModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Create Coupon</span>
                </button>
              </div>
            </div>

            <div className="glass-panel cc-admin-table-card">
              <div className="cc-table-wrapper">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount Offer</th>
                      <th>Validity Period</th>
                      <th>Status</th>
                      <th>Min Order</th>
                      <th>Created By</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsLoading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                          Loading coupons...
                        </td>
                      </tr>
                    ) : filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          No coupons found. Click "Create Coupon" to add one!
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((c) => {
                        const fromStr = new Date(c.validFrom).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });
                        const untilStr = new Date(c.validUntil).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        });

                        const statusColor =
                          c.computedStatus === 'Active'
                            ? '#10B981'
                            : c.computedStatus === 'Expired'
                            ? '#EF4444'
                            : '#F59E0B';

                        return (
                          <tr key={c._id || c.code}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono, monospace)',
                                      fontWeight: 800,
                                      fontSize: '0.92rem',
                                      color: 'var(--accent-cyan, #38bdf8)',
                                      background: 'rgba(56, 189, 248, 0.1)',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid rgba(56, 189, 248, 0.25)',
                                      letterSpacing: '0.06em'
                                    }}
                                  >
                                    {c.code}
                                  </span>
                                </div>
                                {c.description && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {c.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                {c.discountType === 'percentage'
                                  ? `${c.discountValue}% OFF`
                                  : `₹${c.discountValue} FLAT OFF`}
                              </div>
                              {c.discountType === 'percentage' && c.maxDiscountAmount && (
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  Cap: ₹{c.maxDiscountAmount}
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar size={13} color="var(--text-muted)" />
                                <span>{fromStr}</span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span>{untilStr}</span>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  background: `${statusColor}18`,
                                  color: statusColor,
                                  border: `1px solid ${statusColor}40`
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: statusColor
                                  }}
                                />
                                {c.computedStatus}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'None'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {c.createdByName || 'Admin'}
                              </span>
                            </td>
                            <td style={{ width: 110, textAlign: 'right' }}>
                              <button
                                type="button"
                                className="cc-table-action-delete"
                                onClick={() => setCouponToDelete(c)}
                                title="Delete coupon (requires confirmation)"
                              >
                                <Trash2 size={13} />
                                <span>Remove</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REELS MANAGEMENT */}
        {activeTab === 'reels' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div className="cc-search-box" style={{ maxWidth: 360 }}>
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  placeholder="Search reels by title or components..."
                  value={reelSearch}
                  onChange={(e) => setReelSearch(e.target.value)}
                  className="cc-search-input"
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--outline cc-btn--sm"
                  onClick={loadReels}
                  disabled={reelsLoading}
                  title="Reload reels"
                >
                  <RefreshCw size={14} className={reelsLoading ? 'cc-spinner' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--primary cc-btn--sm"
                  onClick={() => setIsAddReelModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    borderColor: 'transparent'
                  }}
                >
                  <Plus size={14} />
                  <span>Add Reel</span>
                </button>
              </div>
            </div>

            <div className="glass-panel cc-admin-table-card">
              <div className="cc-table-wrapper">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>Video Preview</th>
                      <th>Title & Description</th>
                      <th>Level</th>
                      <th>Components Used</th>
                      <th>Added By</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reelsLoading ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0' }}>
                          Loading maker reels from database...
                        </td>
                      </tr>
                    ) : filteredReels.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          No maker reels match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredReels.map((r) => (
                        <tr key={r._id || r.id}>
                          <td style={{ width: 140 }}>
                            <div className="cc-reel-table-thumb">
                              <video
                                src={r.videoUrl}
                                muted
                                playsInline
                                preload="metadata"
                              />
                            </div>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem', marginBottom: 4 }}>
                                {r.title}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.45 }}>
                                {r.description}
                              </p>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>
                                {r.videoUrl}
                              </div>
                            </div>
                          </td>
                          <td style={{ width: 140 }}>
                            <span className={`cc-level-badge ${
                              r.difficulty?.toLowerCase().includes('advanced')
                                ? 'cc-level-badge--advanced'
                                : r.difficulty?.toLowerCase().includes('intermediate')
                                ? 'cc-level-badge--intermediate'
                                : 'cc-level-badge--beginner'
                            }`}>
                              {r.difficulty || 'Beginner Friendly'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 260 }}>
                              {r.components && r.components.length > 0 ? (
                                r.components.map((comp, idx) => (
                                  <span key={idx} className="cc-table-comp-chip">
                                    {comp}
                                  </span>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None</span>
                              )}
                            </div>
                          </td>
                          <td style={{ minWidth: 150 }}>
                            <div className="cc-admin-badge-pill">
                              <span className="cc-admin-tag-user">
                                {r.addedByUsername ? `@${r.addedByUsername}` : '@masteradmin'}
                              </span>
                              <span className="cc-admin-tag-sub">
                                {r.addedByName || 'upVolt Core'}
                              </span>
                            </div>
                          </td>
                          <td style={{ width: 110, textAlign: 'right' }}>
                            <button
                              type="button"
                              className="cc-table-action-delete"
                              onClick={() => setReelToDelete(r)}
                              title="Delete Reel"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT & STATUS UPDATE */}
        {activeTab === 'orders' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                <div className="cc-search-box" style={{ maxWidth: 300 }}>
                  <Search size={16} className="cc-search-icon" />
                  <input
                    type="text"
                    placeholder="Search Order ID, Customer, Phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                    className="cc-search-input"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter size={15} color="var(--text-muted)" />
                  <select
                    className="cc-input cc-select"
                    style={{ width: 170, padding: '6px 10px', fontSize: '0.85rem' }}
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="cc-btn cc-btn--secondary"
                onClick={loadOrders}
                disabled={ordersLoading}
                style={{ padding: '8px 14px' }}
              >
                <RefreshCw size={15} className={ordersLoading ? 'animate-spin' : ''} />
                <span>Refresh Orders</span>
              </button>
            </div>

            <div className="glass-panel cc-admin-table-container">
              <table className="cc-admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer & Campus Address</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Current Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No orders matching current filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={order._id || order.orderId}>
                          <td>
                            <strong>#{order.orderId}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr}</div>
                          </td>
                          <td>
                            <strong>{order.customerName}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              📞 {order.customerPhone}
                            </div>
                            {order.shippingAddress?.address && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 3, fontWeight: 500 }}>
                                🏠 {order.shippingAddress.address}
                              </div>
                            )}
                            {(order.shippingAddress?.collegeName || order.shippingAddress?.hostelName) && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                🏛️ {order.shippingAddress?.collegeName} {order.shippingAddress?.hostelName ? `• ${order.shippingAddress?.hostelName}` : ''} {order.shippingAddress?.roomNo ? `(Room ${order.shippingAddress?.roomNo})` : ''}
                              </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              📍 {order.shippingAddress?.city || 'Delhi'} - {order.shippingAddress?.pincode}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>
                              {order.items?.map(it => `${it.name} (x${it.quantity})`).join(', ')}
                            </span>
                          </td>
                          <td>
                            <strong>₹{order.totalAmount}</strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {order.paymentMethod?.toUpperCase()}
                              </span>
                              {order.deliveryType === 'fast' ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 6px', borderRadius: 4, display: 'inline-block', width: 'fit-content' }}>
                                  ⚡ Fast (₹{order.shippingFee})
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: 4, display: 'inline-block', width: 'fit-content' }}>
                                  Normal ({order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`})
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge variant={order.orderStatus === 'completed' ? 'bestseller' : order.orderStatus === 'shipped' ? 'popular' : 'hot'}>
                              {order.orderStatus?.toUpperCase()}
                            </Badge>
                          </td>
                          <td>
                            <select
                              className="cc-input cc-select cc-status-select"
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: DELIVERY CHARGES & SPEED CONFIGURATION */}
        {activeTab === 'delivery' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="cc-audit-icon-box" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB' }}>
                  <Truck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Delivery Pricing &amp; Speed Controls
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Configure standard and express fast delivery fees across Delhi for both Online &amp; COD checkout.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="cc-btn cc-btn--secondary"
                onClick={loadDeliverySettings}
                disabled={deliveryLoading}
                style={{ padding: '8px 14px' }}
              >
                <RefreshCw size={15} className={deliveryLoading ? 'animate-spin' : ''} />
                <span>Reload Settings</span>
              </button>
            </div>

            {deliveryNotice.text && (
              <div
                className={`cc-delivery-alert-banner ${deliveryNotice.type === 'success' ? 'cc-delivery-alert-banner--success' : 'cc-delivery-alert-banner--error'}`}
                style={{
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 20,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                {deliveryNotice.type === 'success' ? <CheckCircle size={18} color="#10B981" /> : <AlertCircle size={18} color="#EF4444" />}
                <span>{deliveryNotice.text}</span>
              </div>
            )}

            <div className="cc-delivery-admin-grid">
              {/* Left Column: Configuration Form */}
              <form onSubmit={handleSaveDeliverySettings} className="glass-panel cc-delivery-admin-form">
                <div className="cc-delivery-config-header">
                  <h4>Delivery Rates &amp; Delivery Speed</h4>
                  <span className="cc-delivery-config-subtitle">Changes take effect immediately on student checkout.</span>
                </div>

                {/* Normal Delivery Card */}
                <div className="cc-delivery-setting-block">
                  <div className="cc-delivery-setting-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Truck size={18} color="#2563EB" />
                      <strong style={{ fontSize: '1rem' }}>Normal Delivery (Standard)</strong>
                    </div>
                    <span className="cc-badge-pill-standard">Standard Option</span>
                  </div>

                  <div className="cc-delivery-fields-row">
                    <div className="cc-delivery-field">
                      <label>Normal Delivery Fee (₹)</label>
                      <div className="cc-input-with-affix">
                        <span className="cc-input-prefix">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={deliverySettings.normalDeliveryFee}
                          onChange={(e) => setDeliverySettings({
                            ...deliverySettings,
                            normalDeliveryFee: e.target.value
                          })}
                          className="cc-input"
                        />
                      </div>
                      <span className="cc-field-hint">Standard shipping fee charged when under free threshold.</span>
                    </div>

                    <div className="cc-delivery-field">
                      <label>Free Normal Delivery Threshold (₹)</label>
                      <div className="cc-input-with-affix">
                        <span className="cc-input-prefix">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={deliverySettings.freeDeliveryThreshold}
                          onChange={(e) => setDeliverySettings({
                            ...deliverySettings,
                            freeDeliveryThreshold: e.target.value
                          })}
                          className="cc-input"
                        />
                      </div>
                      <span className="cc-field-hint">Cart subtotal at which normal delivery becomes FREE (₹0).</span>
                    </div>
                  </div>

                  <div className="cc-delivery-field" style={{ marginTop: 12 }}>
                    <label>Estimated Delivery Description / Note</label>
                    <input
                      type="text"
                      required
                      value={deliverySettings.normalDeliveryNote}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        normalDeliveryNote: e.target.value
                      })}
                      className="cc-input"
                      placeholder="e.g. Standard Delivery (2-3 Days across Delhi)"
                    />
                  </div>
                </div>

                {/* Fast Delivery Card */}
                <div className="cc-delivery-setting-block cc-delivery-setting-block--fast">
                  <div className="cc-delivery-setting-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={18} color="#F59E0B" />
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Fast Delivery (Express)</strong>
                    </div>
                    <span className="cc-badge-pill-fast">⚡ Express Priority</span>
                  </div>

                  <div className="cc-delivery-fields-row">
                    <div className="cc-delivery-field">
                      <label>Fast Delivery Fee (₹)</label>
                      <div className="cc-input-with-affix">
                        <span className="cc-input-prefix">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={deliverySettings.fastDeliveryFee}
                          onChange={(e) => setDeliverySettings({
                            ...deliverySettings,
                            fastDeliveryFee: e.target.value
                          })}
                          className="cc-input"
                        />
                      </div>
                      <span className="cc-field-hint">Delivery fee charged when student selects Fast Delivery.</span>
                    </div>
                  </div>

                  <div className="cc-delivery-field" style={{ marginTop: 12 }}>
                    <label>Estimated Delivery Description / Note</label>
                    <input
                      type="text"
                      required
                      value={deliverySettings.fastDeliveryNote}
                      onChange={(e) => setDeliverySettings({
                        ...deliverySettings,
                        fastDeliveryNote: e.target.value
                      })}
                      className="cc-input"
                      placeholder="e.g. Express Superfast Delivery (Within 24 Hours)"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button
                    type="submit"
                    className="cc-btn cc-btn--primary"
                    disabled={deliverySaving}
                    style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    {deliverySaving ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Updating Delivery Pricing...</span>
                      </span>
                    ) : (
                      <span>Save Delivery Settings</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Student Checkout Preview */}
              <div className="glass-panel cc-delivery-admin-preview">
                <div className="cc-preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye size={18} color="var(--accent-primary)" />
                    <strong>Live Student View (Checkout Simulation)</strong>
                  </div>
                  <span className="cc-preview-badge">Student UI</span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Here is how students see the Normal and Fast delivery options during Online (Razorpay) &amp; Offline (COD) checkout:
                </p>

                <div className="cc-simulated-checkout-cards">
                  {/* Normal Option */}
                  <div className="cc-simulated-card">
                    <div className="cc-sim-header">
                      <span className="cc-sim-title">Normal Delivery</span>
                      <strong className="cc-sim-price">₹{deliverySettings.normalDeliveryFee}</strong>
                    </div>
                    <p className="cc-sim-note">{deliverySettings.normalDeliveryNote}</p>
                    <div className="cc-sim-tag">🎉 Free on orders ₹{deliverySettings.freeDeliveryThreshold}+</div>
                  </div>

                  {/* Fast Option */}
                  <div className="cc-simulated-card cc-simulated-card--fast">
                    <div className="cc-sim-header">
                      <span className="cc-sim-title" style={{ color: '#D97706' }}>
                        ⚡ Fast Delivery
                      </span>
                      <strong className="cc-sim-price" style={{ color: '#D97706' }}>
                        ₹{deliverySettings.fastDeliveryFee}
                      </strong>
                    </div>
                    <p className="cc-sim-note">{deliverySettings.fastDeliveryNote}</p>
                    <div className="cc-sim-tag cc-sim-tag--fast">⚡ Express Dispatch Guaranteed</div>
                  </div>
                </div>

                <div className="cc-simulated-payment-methods">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Available On Both Payment Modes:
                  </span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <div className="cc-sim-pay-pill">
                      <CheckCircle size={13} color="#10B981" />
                      <span>Online (Razorpay / UPI)</span>
                    </div>
                    <div className="cc-sim-pay-pill">
                      <CheckCircle size={13} color="#10B981" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HOMEPAGE STATS & TRUST METRICS */}
        {activeTab === 'stats' && (
          <div className="cc-admin-tab-content">
            <div className="cc-admin-toolbar glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="cc-audit-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                  <Activity size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Homepage Stats &amp; Trust Bar Controls
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Admin can customize the numbers, labels, and icons displayed on the home page trust strip in real-time.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={handleResetDefaultStats}
                  style={{ padding: '8px 14px' }}
                  title="Reset to default 5000+, 100+, 1000+, 4.8/5"
                >
                  <RefreshCw size={15} />
                  <span>Defaults</span>
                </button>

                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={loadStatsSettings}
                  disabled={statsLoading}
                  style={{ padding: '8px 14px' }}
                >
                  <RefreshCw size={15} className={statsLoading ? 'animate-spin' : ''} />
                  <span>Reload</span>
                </button>

                <button
                  type="button"
                  className="cc-btn cc-btn--outline"
                  onClick={handleAddStatCard}
                  disabled={homepageStats.length >= 6}
                  style={{ padding: '8px 14px' }}
                >
                  <Plus size={15} />
                  <span>Add Stat</span>
                </button>

                <button
                  type="button"
                  className="cc-btn cc-btn--primary"
                  onClick={handleSaveStatsSettings}
                  disabled={statsSaving}
                  style={{ padding: '8px 16px' }}
                >
                  {statsSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {statsNotice.text && (
              <div
                className={`cc-delivery-alert-banner ${statsNotice.type === 'success' ? 'cc-delivery-alert-banner--success' : 'cc-delivery-alert-banner--error'}`}
                style={{
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 20,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                {statsNotice.type === 'success' ? <CheckCircle size={18} color="#10B981" /> : <AlertCircle size={18} color="#EF4444" />}
                <span>{statsNotice.text}</span>
              </div>
            )}

            {/* Live Interactive Preview Box */}
            <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Eye size={16} color="var(--accent-primary)" />
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Preview on Homepage
                  </strong>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Updates in real-time as you type below
                </span>
              </div>

              {/* Exact Stats Bar rendering */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px 30px',
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(homepageStats.length, 4)}, 1fr)`,
                  gap: 20
                }}
              >
                {homepageStats.map((stat, idx) => (
                  <div key={stat.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-glow)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {renderStatIcon(stat.icon, 22)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {stat.number || '0+'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {stat.label || 'Metric description'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Editors for each card */}
            <form onSubmit={handleSaveStatsSettings}>
              <div className="cc-stats-admin-grid">
                {homepageStats.map((stat, index) => (
                  <div key={stat.id || index} className="cc-stat-editor-card glass-panel">
                    <div className="cc-stat-editor-header">
                      <div className="cc-stat-editor-title">
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3B82F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 800
                          }}
                        >
                          #{index + 1}
                        </div>
                        <span>Stat Card {index + 1}</span>
                      </div>

                      {homepageStats.length > 1 && (
                        <button
                          type="button"
                          className="cc-table-action-btn cc-table-action-btn--delete"
                          onClick={() => handleRemoveStatCard(index)}
                          title="Remove this card"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="cc-stat-editor-fields">
                      <div className="cc-stat-field-group">
                        <label className="cc-stat-field-label">Icon</label>
                        <select
                          className="cc-stat-select"
                          value={stat.icon || 'users'}
                          onChange={(e) => handleStatFieldChange(index, 'icon', e.target.value)}
                        >
                          <option value="users">👥 Users / Students</option>
                          <option value="graduation">🎓 Colleges / Degree</option>
                          <option value="package">📦 Packages / Deliveries</option>
                          <option value="heart">❤️ Heart / Satisfaction</option>
                          <option value="star">⭐ Star / Rating</option>
                          <option value="shield">🛡️ Shield / Verified</option>
                          <option value="award">🏆 Award / Excellence</option>
                          <option value="trending">📈 Trending / Growth</option>
                          <option value="truck">🚚 Fast Delivery / Logistics</option>
                          <option value="zap">⚡ Superfast Zap</option>
                          <option value="clock">⏱️ 24/7 Clock</option>
                          <option value="sparkles">✨ Sparkles / Premium</option>
                        </select>
                      </div>

                      <div className="cc-stat-field-group">
                        <label className="cc-stat-field-label">Display Number / Value</label>
                        <input
                          type="text"
                          className="cc-stat-input"
                          placeholder="e.g. 5000+, 100+, 4.8/5"
                          value={stat.number}
                          onChange={(e) => handleStatFieldChange(index, 'number', e.target.value)}
                          required
                        />
                      </div>

                      <div className="cc-stat-field-group">
                        <label className="cc-stat-field-label">Label / Text</label>
                        <input
                          type="text"
                          className="cc-stat-input"
                          placeholder="e.g. Students Trust Us"
                          value={stat.label}
                          onChange={(e) => handleStatFieldChange(index, 'label', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="submit"
                  className="cc-btn cc-btn--primary"
                  disabled={statsSaving}
                  style={{ padding: '12px 28px', fontSize: '0.98rem', fontWeight: 700 }}
                >
                  {statsSaving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle size={17} />}
                  <span>Save All Homepage Stats</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: LIVE TRAFFIC & REAL-TIME VISITOR LOCATIONS (Visible to all 3 Admins) */}
        {activeTab === 'liveTraffic' && (
          <div className="cc-admin-tab-content">
            <div className="cc-live-traffic-banner glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="cc-audit-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                  <Radio size={24} className="animate-pulse" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      Live Website Presence & Visitor Radar
                    </h3>
                    <span className="cc-live-pulse-badge">
                      <span className="cc-pulse-dot" />
                      AUTO-SYNCING (10s)
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    100% authentic real-time traffic telemetry. Pre-deployment localhost traffic is accurately shown as Localhost (Dev). Real reverse-proxy CDN geolocation activates automatically after deployment.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={handleResetAnalytics}
                  disabled={resettingLive || liveLoading}
                  style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
                  title="Clear all test visits and restart telemetry from 0"
                >
                  <Trash2 size={14} />
                  <span>{resettingLive ? 'Resetting...' : 'Clear Test Visits'}</span>
                </button>

                <button
                  type="button"
                  className="cc-btn cc-btn--secondary"
                  onClick={loadLiveAnalytics}
                  disabled={liveLoading}
                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <RefreshCw size={15} className={liveLoading ? 'animate-spin' : ''} />
                  <span>Refresh Radar</span>
                </button>
              </div>
            </div>

            {/* Main Radar Grid */}
            <div className="cc-live-radar-grid">
              {/* Left Column: Real-Time Active Users Stream */}
              <div className="glass-panel cc-radar-panel">
                <div className="cc-radar-panel-header">
                  <h4 className="cc-radar-panel-title">
                    <Users size={18} color="#10B981" />
                    <span>Real-Time Visitor Stream ({liveAnalytics?.recentVisitors?.length || 0})</span>
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Active in past 15 minutes
                  </span>
                </div>

                {(!liveAnalytics?.recentVisitors || liveAnalytics.recentVisitors.length === 0) ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No visitor heartbeat received yet. As users browse the shop, they appear here live.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {liveAnalytics.recentVisitors.map((v, idx) => {
                      const minsAgo = Math.floor((Date.now() - new Date(v.lastActive).getTime()) / 60000);
                      const timeStr = minsAgo <= 0 ? 'Just now' : `${minsAgo}m ago`;

                      return (
                        <div key={v.visitorId || idx} className="cc-live-user-item">
                          <div className="cc-live-user-left">
                            <span
                              className={`cc-live-indicator-dot ${v.isLive ? 'cc-live-indicator-dot--active' : 'cc-live-indicator-dot--idle'}`}
                              title={v.isLive ? 'Active Right Now' : 'Recently Active'}
                            />
                            <div>
                              <div className="cc-live-location-text">
                                <MapPin size={14} color="#10B981" />
                                <span>{v.roughLocation || `${v.city}, ${v.region}`}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ({v.countryCode === 'IN' ? '🇮🇳 India' : v.country})
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span className="cc-live-page-badge">{v.currentPage || '/'}</span>
                                <span className="cc-live-device-tag">
                                  {v.device === 'Mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                                  {v.device}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: v.isLive ? '#10B981' : '#F59E0B',
                              display: 'block'
                            }}>
                              {v.isLive ? 'ONLINE NOW' : `IDLE (${timeStr})`}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {v.totalVisits} page {v.totalVisits === 1 ? 'view' : 'views'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Geographic Distribution & Platforms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Geographic Locations Breakdown */}
                <div className="glass-panel cc-radar-panel">
                  <div className="cc-radar-panel-header">
                    <h4 className="cc-radar-panel-title">
                      <Globe size={18} color="var(--accent-cyan)" />
                      <span>Top Locations</span>
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rough Geolocation</span>
                  </div>

                  {(!liveAnalytics?.topLocations || liveAnalytics.topLocations.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
                      Collecting geolocation data...
                    </p>
                  ) : (
                    liveAnalytics.topLocations.map((loc, i) => {
                      const totalVis = liveAnalytics.totalVisitorsCount || 1;
                      const pct = Math.min(100, Math.round((loc.totalVisitors / totalVis) * 100)) || 10;
                      return (
                        <div key={loc.location || i} className="cc-location-stat-row">
                          <div className="cc-location-stat-header">
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              📍 {loc.location}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {loc.totalVisitors} {loc.totalVisitors === 1 ? 'visitor' : 'visitors'}
                              {loc.liveVisitors > 0 && (
                                <span style={{ marginLeft: 6, color: '#10B981', fontWeight: 700 }}>
                                  ({loc.liveVisitors} live)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="cc-location-stat-bar-track">
                            <div className="cc-location-stat-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Device & Platform Breakdown */}
                <div className="glass-panel cc-radar-panel">
                  <div className="cc-radar-panel-header">
                    <h4 className="cc-radar-panel-title">
                      <Smartphone size={18} color="var(--accent-purple, #A855F7)" />
                      <span>Device Breakdown</span>
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                    <div style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <Monitor size={20} style={{ margin: '0 auto 6px', color: 'var(--accent-cyan)' }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{liveAnalytics?.deviceStats?.Desktop || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Desktop</div>
                    </div>
                    <div style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <Smartphone size={20} style={{ margin: '0 auto 6px', color: '#10B981' }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{liveAnalytics?.deviceStats?.Mobile || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile</div>
                    </div>
                    <div style={{ padding: '12px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <Compass size={20} style={{ margin: '0 auto 6px', color: '#F59E0B' }} />
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{liveAnalytics?.deviceStats?.Tablet || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tablet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY AUDIT LOGS (Visible to all 3 Administrators) */}
        {activeTab === 'audit' && (
          <div className="cc-admin-tab-content">
            <div className="cc-audit-header-banner glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="cc-audit-icon-box">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    Administrator Activity Audit Trail
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Complete transparency across all 3 administrators. Displays which admin added, modified, or removed components, coupons, and mentors.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="cc-btn cc-btn--secondary"
                onClick={loadAuditLogs}
                disabled={auditLoading}
                style={{ padding: '8px 14px' }}
              >
                <RefreshCw size={15} className={auditLoading ? 'animate-spin' : ''} />
                <span>Refresh Log</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="cc-audit-filters glass-panel" style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={15} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Admin:</span>
                <select
                  value={auditAdminFilter}
                  onChange={(e) => setAuditAdminFilter(e.target.value)}
                  className="cc-select"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: 150 }}
                >
                  <option value="all">All Administrators</option>
                  <option value="admin1">@admin1 (Hardware Admin 1)</option>
                  <option value="admin2">@admin2 (Hardware Admin 2)</option>
                  <option value="masteradmin">@masteradmin (System Admin)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action:</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="cc-select"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', minWidth: 170 }}
                >
                  <option value="all">All Actions</option>
                  <option value="PRODUCT_ADDED">Product Added</option>
                  <option value="PRODUCT_DELETED">Product Deleted</option>
                  <option value="COUPON_CREATED">Coupon Created</option>
                  <option value="COUPON_DELETED">Coupon Deleted</option>
                  <option value="REEL_CREATED">Reel Created</option>
                  <option value="REEL_DELETED">Reel Deleted</option>
                  <option value="MENTOR_ADDED">Mentor Added</option>
                  <option value="MENTOR_DELETED">Mentor Deleted</option>
                  <option value="ORDER_STATUS_UPDATED">Order Status Updated</option>
                  <option value="ADMIN_PASSWORD_RESET">Password Reset</option>
                </select>
              </div>
            </div>

            <div className="glass-panel cc-admin-table-container">
              <table className="cc-admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th style={{ minWidth: 150, textAlign: 'center' }}>Action</th>
                    <th>Performed By (Admin)</th>
                    <th>Role</th>
                    <th>Target Item</th>
                    <th>Details & SKU</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        No audit events match the current filter. Try performing an admin action or resetting filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const logDate = new Date(log.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const isAdd = log.action.includes('ADDED') || log.action.includes('CREATED');
                      const isDelete = log.action.includes('DELETED');

                      const usernameTag = log.adminUsername
                        ? `@${log.adminUsername}`
                        : (log.adminName?.toLowerCase().includes('admin 1') ? '@admin1' : log.adminName?.toLowerCase().includes('admin 2') ? '@admin2' : '@masteradmin');

                      return (
                        <tr key={log._id}>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{logDate}</td>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            <span className={`cc-action-badge-pill ${isAdd ? 'cc-action-badge-pill--add' : isDelete ? 'cc-action-badge-pill--del' : 'cc-action-badge-pill--update'}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="cc-admin-badge-pill">
                              <span className="cc-admin-tag-user">{usernameTag}</span>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{log.adminName}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.adminEmail}</span>
                            </div>
                          </td>
                          <td>
                            <code style={{ color: log.adminRole === 'master_admin' ? '#EC4899' : 'var(--accent-cyan)' }}>
                              {log.adminRole === 'master_admin' ? 'Master Admin' : 'Hardware Admin'}
                            </code>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-primary)' }}>{log.targetName || log.targetId || 'N/A'}</strong>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              {log.details ? (
                                typeof log.details === 'object'
                                  ? Object.entries(log.details)
                                      .filter(([k]) => !k.startsWith('_') && k !== 'images')
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(' | ') || 'Action logged'
                                  : String(log.details)
                              ) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN PASSWORD RESET */}
        {activeTab === 'security' && (
          <div className="cc-admin-tab-content">
            <div className="glass-panel cc-admin-security-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="cc-modal-icon-badge">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Admin Password Management</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Admins can independently reset their password at any time.
                  </p>
                </div>
              </div>

              {pwMessage.text && (
                <div className={`cc-modal-alert cc-modal-alert--${pwMessage.type}`} style={{ marginBottom: 18 }}>
                  {pwMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{pwMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="cc-form-group">
                  <label className="cc-form-label">Current Password</label>
                  <input
                    type="password"
                    required
                    className="cc-input"
                    placeholder="Enter your current password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className="cc-form-group">
                  <label className="cc-form-label">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="cc-input"
                    placeholder="Enter new password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  />
                </div>

                <div className="cc-form-group">
                  <label className="cc-form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="cc-input"
                    placeholder="Re-enter new password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    type="submit"
                    className="cc-btn cc-btn--primary"
                    disabled={pwLoading}
                  >
                    {pwLoading ? 'Updating Password...' : 'Reset & Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={() => {
          loadProducts();
          loadStats();
          loadAuditLogs();
        }}
      />
      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        product={productToEdit}
        onProductUpdated={() => {
          loadProducts();
          loadStats();
          loadAuditLogs();
        }}
      />
      
      {/* GitHub-Style Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => {
          if (!deleteLoading) setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete?.name || ''}
        itemSku={productToDelete?.sku || ''}
        itemCategory={productToDelete?.category || ''}
        itemPrice={productToDelete?.price || ''}
        itemImage={productToDelete?.images?.[0] || productToDelete?.image || ''}
        itemType="component"
        loading={deleteLoading}
      />

      {/* Add Mentor Modal */}
      <AddMentorModal
        isOpen={isAddMentorModalOpen}
        onClose={() => setIsAddMentorModalOpen(false)}
        onMentorAdded={loadMentors}
      />
      
      <EditMentorModal
        isOpen={isEditMentorModalOpen}
        onClose={() => {
          setIsEditMentorModalOpen(false);
          setMentorToEdit(null);
        }}
        mentor={mentorToEdit}
        onMentorUpdated={loadMentors}
      />
      
      {/* Add Coupon Modal */}
      <AddCouponModal
        isOpen={isAddCouponModalOpen}
        onClose={() => setIsAddCouponModalOpen(false)}
        onCouponAdded={() => {
          loadCoupons();
          loadAuditLogs();
        }}
      />

      {/* GitHub-Style Delete Confirmation Modal for Mentors */}
      <DeleteConfirmModal
        isOpen={Boolean(mentorToDelete)}
        onClose={() => {
          if (!deleteMentorLoading) setMentorToDelete(null);
        }}
        onConfirm={handleConfirmDeleteMentor}
        itemName={mentorToDelete?.name || ''}
        itemSku={mentorToDelete?.role || ''}
        itemCategory={mentorToDelete?.college || ''}
        itemImage={mentorToDelete?.image || ''}
        itemType="mentor"
        loading={deleteMentorLoading}
      />


      {/* GitHub-Style Delete Confirmation Modal for Coupons */}
      <DeleteConfirmModal
        isOpen={Boolean(couponToDelete)}
        onClose={() => {
          if (!deleteCouponLoading) setCouponToDelete(null);
        }}
        onConfirm={handleConfirmDeleteCoupon}
        itemName={couponToDelete?.code || ''}
        itemSku={couponToDelete?.discountType === 'percentage' ? `${couponToDelete?.discountValue}% OFF` : `₹${couponToDelete?.discountValue} FLAT OFF`}
        itemCategory={couponToDelete ? `Valid: ${new Date(couponToDelete.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(couponToDelete.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
        itemType="coupon"
        loading={deleteCouponLoading}
      />

      {/* Add Maker Reel Modal */}
      <AddReelModal
        isOpen={isAddReelModalOpen}
        onClose={() => setIsAddReelModalOpen(false)}
        onReelAdded={() => {
          loadReels();
          loadAuditLogs();
        }}
      />

      {/* GitHub-Style Delete Confirmation Modal for Reels */}
      <DeleteConfirmModal
        isOpen={Boolean(reelToDelete)}
        onClose={() => {
          if (!deleteReelLoading) setReelToDelete(null);
        }}
        onConfirm={handleConfirmDeleteReel}
        itemName={reelToDelete?.title || ''}
        itemSku={reelToDelete?.difficulty || 'Project Reel'}
        itemCategory={reelToDelete?.components?.join(', ') || ''}
        itemType="reel"
        loading={deleteReelLoading}
      />
    </div>
  );
};
