import { Hono } from 'hono';
import { Product } from '../models/Product.js';

const router = new Hono();

router.get('/', async (c) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).select('_id updatedAt').sort({ updatedAt: -1 });
    
    // Frontend base URL (change if deployed on a different domain)
    const baseUrl = process.env.FRONTEND_URL || 'https://upvolt.site';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Core static routes
    const staticRoutes = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/shop', priority: '0.9', changefreq: 'daily' },
      { url: '/categories', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' }
    ];
    
    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `  </url>\n`;
    });
    
    // Dynamic Product routes
    products.forEach(product => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${product._id}</loc>\n`;
      xml += `    <lastmod>${product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString()}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    c.res.headers.set('Content-Type', 'application/xml');
    c.res.headers.set('Cache-Control', 'public, max-age=3600');
    return c.body(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return c.text('Error generating sitemap', 500);
  }
});

export default router;
