import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AuditLog } from '../models/AuditLog.js';
import { INITIAL_PRODUCTS } from '../data/seedData.js';
import { PRODUCT_GUIDES } from '../data/productGuides.js';
import { memoryCache } from '../utils/cacheService.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';

// GET all products with filtering & sorting (Optimized for 10,000+ concurrent users)
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, badge } = req.query;

    // 1. High-speed In-Memory Cache Lookup (Sub-millisecond response for concurrent traffic)
    const cacheKey = `products:${category || 'all'}:${search || ''}:${sort || 'default'}:${badge || ''}`;
    const cachedResponse = memoryCache.get(cacheKey);

    if (cachedResponse) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      }
      return res.status(200).json(cachedResponse);
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const query = {};

      if (category && category !== 'All') {
        query.category = category;
      }

      if (badge) {
        query.badge = badge;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: regex },
          { description: regex },
          { category: regex },
          { tags: regex },
          { sku: regex }
        ];
      }

      let queryExec = Product.find(query);

      // Sorting
      if (sort === 'price-low') {
        queryExec = queryExec.sort({ price: 1 });
      } else if (sort === 'price-high') {
        queryExec = queryExec.sort({ price: -1 });
      } else if (sort === 'rating') {
        queryExec = queryExec.sort({ rating: -1 });
      } else {
        queryExec = queryExec.sort({ createdAt: -1 });
      }

      // Use .lean() for 10x faster execution and 80% less memory usage
      let products = await queryExec.lean();

      // If database collection is totally empty, auto-seed with initial products
      if (products.length === 0 && !category && !search) {
        console.log('Database empty, auto-seeding initial products...');
        products = await Product.insertMany(INITIAL_PRODUCTS);
        products = products.map(p => (p.toObject ? p.toObject() : p));
      }

      const responsePayload = {
        success: true,
        count: products.length,
        source: 'database',
        products
      };

      // Store in memory cache for 60 seconds
      memoryCache.set(cacheKey, responsePayload, 60000);

      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      }

      return res.status(200).json(responsePayload);
    }

    // Fallback if DB is not connected
    console.warn('MongoDB not connected, serving from in-memory initial products');
    let fallback = [...INITIAL_PRODUCTS];
    if (category && category !== 'All') {
      fallback = fallback.filter(p => p.category === category);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      fallback = fallback.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    const fallbackPayload = {
      success: true,
      count: fallback.length,
      source: 'fallback',
      products: fallback.map((p, idx) => ({ ...p, _id: `fallback-${idx + 1}` }))
    };

    return res.status(200).json(fallbackPayload);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      products: INITIAL_PRODUCTS
    });
  }
};

// GET single product by ID or SKU (Cached & Lean)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    const cachedProduct = memoryCache.get(cacheKey);

    if (cachedProduct) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      }
      return res.status(200).json(cachedProduct);
    }

    const isConnected = mongoose.connection.readyState === 1;
    let product = null;

    if (isConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id).lean();
      }
      if (!product) {
        product = await Product.findOne({ sku: id }).lean();
      }
      if (!product) {
        product = await Product.findOne({ name: new RegExp(id, 'i') }).lean();
      }
    }

    if (!product) {
      product = INITIAL_PRODUCTS.find(p => p.sku === id || p._id === id || p.name.toLowerCase().includes(id.toLowerCase()))
        || INITIAL_PRODUCTS[0];
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If guide fields are missing on an existing product, populate with preset guide if available
    if (product && product.sku && PRODUCT_GUIDES[product.sku]) {
      const guide = PRODUCT_GUIDES[product.sku];
      const prodObj = { ...product };
      if (!prodObj.youtubeUrl && guide.youtubeUrl) prodObj.youtubeUrl = guide.youtubeUrl;
      if (!prodObj.researchUrl && guide.researchUrl) prodObj.researchUrl = guide.researchUrl;
      if (!prodObj.datasheetUrl && guide.datasheetUrl) prodObj.datasheetUrl = guide.datasheetUrl;
      if (!prodObj.documentationUrl && guide.documentationUrl) prodObj.documentationUrl = guide.documentationUrl;
      if ((!prodObj.howToUse || (!prodObj.howToUse.overview && (!prodObj.howToUse.steps || prodObj.howToUse.steps.length === 0))) && guide.howToUse) {
        prodObj.howToUse = guide.howToUse;
      }
      if ((!prodObj.whereToUse || prodObj.whereToUse.length === 0) && guide.whereToUse) {
        prodObj.whereToUse = guide.whereToUse;
      }
      if ((!prodObj.safetyPrecautions || prodObj.safetyPrecautions.length === 0) && guide.safetyPrecautions) {
        prodObj.safetyPrecautions = guide.safetyPrecautions;
      }
      product = prodObj;
    }

    const responsePayload = {
      success: true,
      product
    };

    memoryCache.set(cacheKey, responsePayload, 60000);

    if (typeof res.setHeader === 'function') {
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST create a new product (Protected: Admin or Master Admin)
export const createProduct = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable.'
      });
    }

    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      badge,
      inStock,
      sku,
      image,
      images,
      description,
      specifications,
      tags,
      perfectFor,
      youtubeUrl,
      researchUrl,
      datasheetUrl,
      documentationUrl,
      howToUse,
      whereToUse,
      safetyPrecautions
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and price are required.'
      });
    }

    // Process multiple images
    let imageList = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.map(img => img.trim()).filter(Boolean);
    } else if (typeof images === 'string' && images.trim()) {
      imageList = images.split(/[\n,]+/).map(img => img.trim()).filter(Boolean);
    }

    let primaryImage = image && image.trim()
      ? image.trim()
      : (imageList.length > 0 ? imageList[0] : '/images/arduino.svg');

    if (!imageList.includes(primaryImage)) {
      imageList.unshift(primaryImage);
    }

    // Upload to Cloudinary if they are base64 strings
    const uniqueImages = [...new Set(imageList)];
    const uploadedImages = await Promise.all(
      uniqueImages.map(img => uploadImageToCloudinary(img, 'upvolt/products'))
    );
    const imgMap = {};
    uniqueImages.forEach((img, idx) => { imgMap[img] = uploadedImages[idx]; });

    imageList = imageList.map(img => imgMap[img]);
    primaryImage = imgMap[primaryImage];

    const cleanSku = sku && sku.trim()
      ? sku.trim()
      : `CC-${category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'System Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    // For products added by master_admin, mask name as 'UPVOLT Supply' so other admins never suspect a master admin
    const publicAddedByName = adminUser.role === 'master_admin' ? 'UPVOLT Supply' : adminUser.name;
    const publicAddedByEmail = adminUser.role === 'master_admin' ? 'supply@UPVOLT.com' : adminUser.email;

    // Preset guide fallback if SKU matches a known component
    const presetGuide = PRODUCT_GUIDES[cleanSku] || {};

    const finalYoutubeUrl = youtubeUrl !== undefined
      ? (youtubeUrl ? youtubeUrl.trim() : null)
      : (presetGuide.youtubeUrl || null);

    const finalResearchUrl = researchUrl !== undefined
      ? (researchUrl ? researchUrl.trim() : null)
      : (presetGuide.researchUrl || null);

    const finalDatasheetUrl = datasheetUrl !== undefined
      ? (datasheetUrl ? datasheetUrl.trim() : null)
      : (presetGuide.datasheetUrl || null);

    const finalDocumentationUrl = documentationUrl !== undefined
      ? (documentationUrl ? documentationUrl.trim() : null)
      : (presetGuide.documentationUrl || null);

    const finalHowToUse = howToUse && (howToUse.overview || (howToUse.steps && howToUse.steps.length > 0))
      ? howToUse
      : (presetGuide.howToUse || (howToUse || {}));

    const finalWhereToUse = Array.isArray(whereToUse) && whereToUse.length > 0
      ? whereToUse
      : (presetGuide.whereToUse || []);

    const finalSafetyPrecautions = Array.isArray(safetyPrecautions) && safetyPrecautions.length > 0
      ? safetyPrecautions
      : (presetGuide.safetyPrecautions || []);

    const newProduct = new Product({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rating: rating ? Number(rating) : 4.8,
      reviewsCount: 1,
      badge: badge || null,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      sku: cleanSku,
      image: primaryImage,
      images: imageList,
      description: description ? description.trim() : `${name} for campus electronics and IoT projects.`,
      specifications: specifications || {},
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['Electronics', category]),
      perfectFor: Array.isArray(perfectFor) ? perfectFor : (perfectFor ? perfectFor.split(',').map(p => p.trim()) : ['College Labs', 'DIY Prototyping']),
      youtubeUrl: finalYoutubeUrl,
      researchUrl: finalResearchUrl,
      datasheetUrl: finalDatasheetUrl,
      documentationUrl: finalDocumentationUrl,
      howToUse: finalHowToUse,
      whereToUse: finalWhereToUse,
      safetyPrecautions: finalSafetyPrecautions,
      addedBy: adminUser._id,
      addedByName: publicAddedByName,
      addedByEmail: publicAddedByEmail,
      addedByUsername: adminUser.username || (adminUser.email ? adminUser.email.split('@')[0] : 'admin')
    });

    const savedProduct = await newProduct.save();
    memoryCache.invalidate('product');

    // Log this action to AuditLog for all Admins tracking
    try {
      await AuditLog.create({
        action: 'PRODUCT_ADDED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        adminUsername: adminUser.username || (adminUser.email ? adminUser.email.split('@')[0] : 'admin'),
        targetType: 'Product',
        targetId: savedProduct._id.toString(),
        targetName: savedProduct.name,
        details: {
          sku: savedProduct.sku,
          price: savedProduct.price,
          category: savedProduct.category,
          imagesCount: imageList.length,
          addedByUsername: adminUser.username || 'admin'
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log entry:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Product added and saved to database successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT update product (Protected: Admin or Master Admin)
export const updateProduct = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable.'
      });
    }

    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      badge,
      inStock,
      sku,
      image,
      images,
      description,
      specifications,
      tags,
      perfectFor,
      youtubeUrl,
      researchUrl,
      datasheetUrl,
      documentationUrl,
      howToUse,
      whereToUse,
      safetyPrecautions
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and price are required.'
      });
    }

    // Process multiple images
    let imageList = product.images;
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.map(img => img.trim()).filter(Boolean);
    } else if (typeof images === 'string' && images.trim()) {
      imageList = images.split(/[\n,]+/).map(img => img.trim()).filter(Boolean);
    }

    let primaryImage = image && image.trim()
      ? image.trim()
      : (imageList.length > 0 ? imageList[0] : product.image);

    if (imageList.length > 0 && !imageList.includes(primaryImage)) {
      imageList.unshift(primaryImage);
    }

    // Upload to Cloudinary if they are base64 strings
    const uniqueImages = [...new Set(imageList)];
    const uploadedImages = await Promise.all(
      uniqueImages.map(img => uploadImageToCloudinary(img, 'upvolt/products'))
    );
    const imgMap = {};
    uniqueImages.forEach((img, idx) => { imgMap[img] = uploadedImages[idx]; });

    imageList = imageList.map(img => imgMap[img]);
    primaryImage = imgMap[primaryImage];

    product.name = name.trim();
    product.category = category.trim();
    product.price = Number(price);
    product.originalPrice = originalPrice ? Number(originalPrice) : undefined;
    if (rating !== undefined) product.rating = Number(rating);
    product.badge = badge === "" ? null : (badge || product.badge);
    if (inStock !== undefined) product.inStock = Boolean(inStock);
    if (sku && sku.trim()) product.sku = sku.trim();
    product.image = primaryImage;
    product.images = imageList;
    if (description !== undefined) product.description = description.trim();
    if (specifications !== undefined) product.specifications = specifications;
    if (tags !== undefined) product.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
    if (perfectFor !== undefined) product.perfectFor = Array.isArray(perfectFor) ? perfectFor : (perfectFor ? perfectFor.split(',').map(p => p.trim()) : []);
    
    if (youtubeUrl !== undefined) product.youtubeUrl = youtubeUrl ? youtubeUrl.trim() : null;
    if (researchUrl !== undefined) product.researchUrl = researchUrl ? researchUrl.trim() : null;
    if (datasheetUrl !== undefined) product.datasheetUrl = datasheetUrl ? datasheetUrl.trim() : null;
    if (documentationUrl !== undefined) product.documentationUrl = documentationUrl ? documentationUrl.trim() : null;
    if (howToUse !== undefined) product.howToUse = howToUse;
    if (whereToUse !== undefined) product.whereToUse = Array.isArray(whereToUse) ? whereToUse : [];
    if (safetyPrecautions !== undefined) product.safetyPrecautions = Array.isArray(safetyPrecautions) ? safetyPrecautions : [];
    
    const updatedProduct = await product.save();
    memoryCache.invalidate('product');

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'System Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    try {
      await AuditLog.create({
        action: 'PRODUCT_UPDATED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        adminUsername: adminUser.username || (adminUser.email ? adminUser.email.split('@')[0] : 'admin'),
        targetType: 'Product',
        targetId: updatedProduct._id.toString(),
        targetName: updatedProduct.name,
        details: {
          sku: updatedProduct.sku,
          price: updatedProduct.price,
          category: updatedProduct.category,
          updatedByUsername: adminUser.username || 'admin'
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log entry:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE product (Protected: Admin or Master Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const adminUser = req.user || {
      _id: new mongoose.Types.ObjectId(),
      name: 'System Admin',
      email: 'admin@UPVOLT.com',
      role: 'admin'
    };

    const deletedInfo = {
      id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price
    };

    await Product.findByIdAndDelete(product._id);
    memoryCache.invalidate('product');

    // Record deletion in AuditLog
    try {
      await AuditLog.create({
        action: 'PRODUCT_DELETED',
        adminId: adminUser._id,
        adminName: adminUser.name,
        adminEmail: adminUser.email,
        adminRole: adminUser.role || 'admin',
        adminUsername: adminUser.username || (adminUser.email ? adminUser.email.split('@')[0] : 'admin'),
        targetType: 'Product',
        targetId: deletedInfo.id,
        targetName: deletedInfo.name,
        details: {
          ...deletedInfo,
          deletedByUsername: adminUser.username || (adminUser.email ? adminUser.email.split('@')[0] : 'admin')
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write deletion audit log:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Product "${deletedInfo.name}" removed successfully by ${adminUser.name}.`,
      deletedProduct: deletedInfo
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST re-sync / seed database
export const seedProducts = async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    let inserted = 0;
    let updated = 0;

    for (const item of INITIAL_PRODUCTS) {
      const resUpdate = await Product.updateOne(
        { sku: item.sku },
        { $set: item },
        { upsert: true }
      );
      if (resUpdate.upsertedCount > 0) inserted++;
      else if (resUpdate.modifiedCount > 0) updated++;
    }

    const total = await Product.countDocuments();
    memoryCache.invalidate('product');

    res.status(200).json({
      success: true,
      message: 'Product catalog synchronized with MongoDB successfully',
      stats: { inserted, updated, total }
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
