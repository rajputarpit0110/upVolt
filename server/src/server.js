import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { connectDB } from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { serveStatic } from '@hono/node-server/serve-static';
import { initKeepAlive } from './utils/keepAlive.js';

const app = new Hono();
const PORT = Number(process.env.PORT) || 5001;

// Normalize trailing slashes if present (e.g., /api/products/ -> /api/products)
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    const newUrl = new URL(c.req.url);
    newUrl.pathname = url.pathname.slice(0, -1);
    return app.fetch(new Request(newUrl.toString(), c.req.raw));
  }
  await next();
});

// CORS middleware
app.use('*', cors({
  origin: (origin) => origin || '*',
  credentials: true
}));

// Logger middleware
app.use('*', logger());

// Basic health check endpoints (/health & /api/health)
const healthHandler = (c) => {
  return c.json({
    status: 'success',
    message: 'upVolt API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'production'
  }, 200);
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Central 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Route not found'
  }, 404);
});

// Central error handler
app.onError((err, c) => {
  console.error('Unhandled server error:', err);
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error'
  }, 500);
});

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/mentors', mentorRoutes);
app.route('/api/coupons', couponRoutes);
app.route('/api/payments', paymentRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/reels', reelRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/messages', messageRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/categories', categoryRoutes);
app.use('/uploads/*', serveStatic({ root: './public' }));

// Start server
const startServer = async () => {
  await connectDB();
  serve({
    fetch: app.fetch,
    port: PORT
  }, (info) => {
    console.log(`🚀 upVolt Server active on http://localhost:${info.port}`);
    // Initialize automated 10-minute keep-alive pinger for Render & Cloud servers
    initKeepAlive(info.port);
  });
};

startServer();
