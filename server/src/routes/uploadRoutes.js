import { Hono } from 'hono';
import { uploadFileBuffer } from '../config/cloudinary.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = new Hono();

/**
 * POST /api/upload
 * Supports single file ('file' or 'image') or multiple files ('files' or 'images')
 * Accepts multipart/form-data or JSON payload with base64 data
 */
router.post('/', async (c) => {
  try {
    const contentType = c.req.header('content-type') || '';
    const uploadedResults = [];

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody({ all: true });

      // Gather all potential file fields
      const candidateFiles = [];

      ['file', 'image', 'files', 'images', 'media'].forEach((fieldKey) => {
        const val = body[fieldKey];
        if (Array.isArray(val)) {
          candidateFiles.push(...val);
        } else if (val && typeof val === 'object' && typeof val.arrayBuffer === 'function') {
          candidateFiles.push(val);
        }
      });

      if (candidateFiles.length === 0) {
        return c.json({
          success: false,
          message: 'No files provided in form-data. Use "file", "image", or "images".'
        }, 400);
      }

      for (const fileObj of candidateFiles) {
        if (typeof fileObj.arrayBuffer === 'function') {
          const arrayBuf = await fileObj.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          const uploadRes = await uploadFileBuffer(buffer, {
            filename: fileObj.name || 'component-photo.jpg'
          });
          uploadedResults.push(uploadRes);
        }
      }
    } else if (contentType.includes('application/json')) {
      // Support direct base64 upload to Cloudinary if needed
      const body = await c.req.json();
      const rawData = body.data || body.image || body.file;

      if (!rawData || typeof rawData !== 'string') {
        return c.json({
          success: false,
          message: 'Please provide base64 data in "image" or "data" field.'
        }, 400);
      }

      // Strip data:image/...;base64,
      const base64Data = rawData.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const uploadRes = await uploadFileBuffer(buffer, {
        filename: body.filename || 'component-photo.jpg'
      });
      uploadedResults.push(uploadRes);
    } else {
      return c.json({
        success: false,
        message: 'Unsupported content-type. Use multipart/form-data or application/json.'
      }, 400);
    }

    if (uploadedResults.length === 1) {
      return c.json({
        success: true,
        message: 'File uploaded successfully',
        url: uploadedResults[0].url,
        file: uploadedResults[0]
      });
    }

    return c.json({
      success: true,
      message: `${uploadedResults.length} files uploaded successfully`,
      urls: uploadedResults.map(r => r.url),
      files: uploadedResults
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return c.json({
      success: false,
      message: error.message || 'File upload failed'
    }, 500);
  }
});

export default router;
