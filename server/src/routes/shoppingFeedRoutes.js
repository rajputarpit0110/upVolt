import { Hono } from 'hono';
import { Product } from '../models/Product.js';

const router = new Hono();

router.get('/', async (c) => {
  try {
    const products = await Product.find({ isActive: { $ne: false } }).sort({ updatedAt: -1 });

    // Frontend base URL (change if deployed on a different domain)
    const baseUrl = process.env.FRONTEND_URL || 'https://upvolt.site';
    const brandName = 'upVolt';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>upVolt Product Feed</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Product catalog for upVolt - Electronic components, IoT kits, and robotics</description>\n`;

    products.forEach(product => {
      // Escape special characters in text fields
      const escapeXml = (unsafe) => {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&'"]/g, (c) => {
          switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
          }
        });
      };

      const title = escapeXml(product.name);
      const description = escapeXml(product.description || `Buy ${product.name} at upVolt`);
      const link = `${baseUrl}/product/${product._id}`;
      // Use primary image or default, ensure it's absolute URL if possible. Cloudinary URLs are absolute.
      const imageLink = product.image && product.image.startsWith('http')
        ? product.image
        : `${baseUrl}${product.image || '/images/realistic/arduino_uno.jpg'}`;

      const priceStr = `${product.price.toFixed(2)} INR`;
      const availabilityStr = product.inStock && product.stockQuantity > 0 ? 'in_stock' : 'out_of_stock';

      xml += `    <item>\n`;
      xml += `      <g:id>${product._id}</g:id>\n`;
      xml += `      <g:title>${title}</g:title>\n`;
      xml += `      <g:description>${description}</g:description>\n`;
      xml += `      <g:link>${link}</g:link>\n`;
      xml += `      <g:image_link>${imageLink}</g:image_link>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>${availabilityStr}</g:availability>\n`;
      xml += `      <g:price>${priceStr}</g:price>\n`;
      xml += `      <g:brand>${brandName}</g:brand>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    c.res.headers.set('Content-Type', 'application/xml');
    c.res.headers.set('Cache-Control', 'public, max-age=3600');
    return c.body(xml);
  } catch (error) {
    console.error('Google Shopping Feed generation error:', error);
    return c.text('Error generating shopping feed', 500);
  }
});

export default router;
