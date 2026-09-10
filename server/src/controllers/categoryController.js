import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AuditLog } from '../models/AuditLog.js';
import { memoryCache } from '../utils/cacheService.js';

// Default initial categories for automated database seeding
const DEFAULT_CATEGORIES = [
  {
    name: 'Development Boards',
    slug: 'development-boards',
    description: 'Microcontrollers, ARM development boards, and programmable modules',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022736/upvolt/products/file_gt1k6x.jpg',
    order: 1
  },
  {
    name: 'Sensors',
    slug: 'sensors',
    description: 'Ultrasonic, environmental, motion, temperature, and gas detection sensors',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022706/upvolt/products/file_rucpsv.jpg',
    order: 2
  },
  {
    name: 'Modules',
    slug: 'modules',
    description: 'Wi-Fi, Bluetooth, relay modules, step-down converters, and displays',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022710/upvolt/products/file_awxorc.jpg',
    order: 3
  },
  {
    name: 'IoT Kits',
    slug: 'iot-kits',
    description: 'Complete hands-on engineering project kits for students and makers',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022807/upvolt/products/file_fmrz1x.jpg',
    order: 4
  },
  {
    name: 'Motors & Drivers',
    slug: 'motors-drivers',
    description: 'DC gear motors, servos, stepper motors, and motor driver shields',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022879/upvolt/products/file_gpp60u.jpg',
    order: 5
  },
  {
    name: 'Power & Components',
    slug: 'power-components',
    description: 'Power supplies, breadboards, voltage regulators, and ICs',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022991/upvolt/products/file_xjbtbk.jpg',
    order: 6
  },
  {
    name: 'Cables & Connectors',
    slug: 'cables-connectors',
    description: 'Dupont jumper wires, USB interface cables, headers, and crocodile clips',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789023037/upvolt/products/file_lx3wxn.jpg',
    order: 7
  },
  {
    name: 'Project Kits',
    slug: 'project-kits',
    description: 'Smart weather kits, plant care kits, and robotic chassis systems',
    image: 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789022967/upvolt/products/file_kmps40.jpg',
    order: 8
  }
];

/**
 * GET all categories (Cached for 10,000+ users scaling)
 */
export const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
    const cached = memoryCache.get(cacheKey);

    if (cached) {
      if (typeof res.setHeader === 'function') {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      }
      return res.status(200).json(cached);
    }

    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      return res.status(200).json({
        success: true,
        count: DEFAULT_CATEGORIES.length,
        categories: DEFAULT_CATEGORIES
      });
    }

    // Check if categories collection is empty -> auto seed
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('Seeding initial default categories into database...');
      await Category.insertMany(DEFAULT_CATEGORIES);
    }

    const filter = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();

    // Dynamically calculate live product counts per category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    productCounts.forEach(pc => {
      if (pc._id) countMap[pc._id] = pc.count;
    });

    const enriched = categories.map(cat => ({
      ...cat,
      productCount: countMap[cat.name] || 0
    }));

    const responsePayload = {
      success: true,
      count: enriched.length,
      categories: enriched
    };

    memoryCache.set(cacheKey, responsePayload, 60000);

    if (typeof res.setHeader === 'function') {
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST create a new category (Protected: Admin or Master Admin)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const cleanName = name.trim();
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category "${cleanName}" already exists.`
      });
    }

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Default order to highest order + 1 if not provided
    let sortOrder = Number(order);
    if (isNaN(sortOrder)) {
      const highest = await Category.findOne().sort({ order: -1 }).lean();
      sortOrder = highest ? (highest.order || 0) + 1 : 1;
    }

    const category = await Category.create({
      name: cleanName,
      slug,
      description: description?.trim() || '',
      image: image?.trim() || 'https://res.cloudinary.com/uzyiejkw/image/upload/v1789023175/upvolt/products/file_hnbypp.jpg',
      order: sortOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user?._id || req.user?.id,
      createdByName: req.user?.username || req.user?.name || 'upVolt Admin'
    });

    // Invalidate categories cache and product cache
    memoryCache.invalidate('categories');
    memoryCache.invalidate('product');

    // Record audit log
    try {
      await AuditLog.create({
        adminId: req.user?._id || req.user?.id,
        adminUsername: req.user?.username || 'admin',
        adminName: req.user?.name || 'Admin',
        action: 'CREATE_CATEGORY',
        targetType: 'CATEGORY',
        targetId: category._id.toString(),
        targetName: category.name,
        details: `Created new category "${category.name}"`
      });
    } catch (auditErr) {
      console.warn('Failed to record audit log for createCategory:', auditErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Category "${category.name}" created successfully`,
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT update an existing category (Protected: Admin or Master Admin)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, order, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const oldName = category.name;
    let nameChanged = false;

    if (name && name.trim() && name.trim() !== category.name) {
      const cleanName = name.trim();
      const existing = await Category.findOne({
        name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
        _id: { $ne: id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Another category with name "${cleanName}" already exists.`
        });
      }

      category.name = cleanName;
      category.slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      nameChanged = true;
    }

    if (description !== undefined) category.description = description.trim();
    if (image !== undefined && image.trim()) category.image = image.trim();
    if (order !== undefined && !isNaN(Number(order))) category.order = Number(order);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    // If category name changed, update all products belonging to the old category
    if (nameChanged) {
      await Product.updateMany(
        { category: oldName },
        { $set: { category: category.name } }
      );
    }

    // Invalidate caches
    memoryCache.invalidate('categories');
    memoryCache.invalidate('product');

    // Record audit log
    try {
      await AuditLog.create({
        adminId: req.user?._id || req.user?.id,
        adminUsername: req.user?.username || 'admin',
        adminName: req.user?.name || 'Admin',
        action: 'UPDATE_CATEGORY',
        targetType: 'CATEGORY',
        targetId: category._id.toString(),
        targetName: category.name,
        details: `Updated category "${category.name}"${nameChanged ? ` (renamed from "${oldName}")` : ''}`
      });
    } catch (auditErr) {
      console.warn('Failed to record audit log for updateCategory:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" updated successfully`,
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE a category (Protected: Admin or Master Admin)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { reassignTo, force } = req.query;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if products belong to this category
    const linkedProductsCount = await Product.countDocuments({ category: category.name });

    if (linkedProductsCount > 0 && force !== 'true' && !reassignTo) {
      return res.status(400).json({
        success: false,
        hasProducts: true,
        linkedProductsCount,
        message: `Category "${category.name}" has ${linkedProductsCount} product(s) assigned to it. Please reassign products or confirm deletion.`
      });
    }

    // Reassign products if reassignTo category name or ID is specified
    if (linkedProductsCount > 0 && reassignTo) {
      let targetCatName = reassignTo;
      if (mongoose.Types.ObjectId.isValid(reassignTo)) {
        const target = await Category.findById(reassignTo);
        if (target) targetCatName = target.name;
      }
      await Product.updateMany(
        { category: category.name },
        { $set: { category: targetCatName } }
      );
      console.log(`Reassigned ${linkedProductsCount} products from "${category.name}" to "${targetCatName}"`);
    } else if (linkedProductsCount > 0 && force === 'true') {
      // Reassign to "General" fallback category so products don't break
      await Product.updateMany(
        { category: category.name },
        { $set: { category: 'General' } }
      );
    }

    await Category.findByIdAndDelete(id);

    // Invalidate caches
    memoryCache.invalidate('categories');
    memoryCache.invalidate('product');

    // Record audit log
    try {
      await AuditLog.create({
        adminId: req.user?._id || req.user?.id,
        adminUsername: req.user?.username || 'admin',
        adminName: req.user?.name || 'Admin',
        action: 'DELETE_CATEGORY',
        targetType: 'CATEGORY',
        targetId: id,
        targetName: category.name,
        details: `Deleted category "${category.name}" (linked products: ${linkedProductsCount})`
      });
    } catch (auditErr) {
      console.warn('Failed to record audit log for deleteCategory:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
