/**
 * Utility to generate responsive, high-efficiency Cloudinary CDN URLs.
 * Automatically injects f_auto (AVIF/WebP), q_auto:good, and width caps.
 */
export const getOptimizedImageUrl = (url, opts = {}) => {
  if (!url || typeof url !== 'string') return url || '/logo-circuit.svg';

  // If it is a Cloudinary URL, inject transformations
  if (url.includes('res.cloudinary.com')) {
    const width = opts.width || 400;
    const quality = opts.quality || 'auto:good';
    const format = opts.format || 'auto';
    const crop = opts.crop || 'limit';

    // If already has transformation segment, return
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/w_')) {
      return url;
    }

    const transform = `f_${format},q_${quality},w_${width},c_${crop}`;
    return url.replace('/image/upload/', `/image/upload/${transform}/`);
  }

  // If local static JPEG in /images/realistic/, prefer WebP
  if (url.startsWith('/images/realistic/') && url.endsWith('.jpg')) {
    return url.replace(/\.jpg$/, '.webp');
  }

  return url;
};

/**
 * Generate standard srcset for responsive image tags
 */
export const getOptimizedSrcSet = (url, widths = [300, 600]) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return undefined;
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
};
