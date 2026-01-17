import express, { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { mediaUpload } from '../middlewares/mediaUpload.js';
import * as uploadController from '../controllers/uploadController.js';

const router: Router = express.Router();

/**
 * POST /api/upload
 * Upload a single file (image).
 * Query params:
 * - folder: Optional folder name (default: "uploads")
 * Body:
 * - file: The binary file
 */
router.post(
  '/',
  authenticate,
  // We use 'file' as the field name.
  // We can also allow 'image' if we want, but sticking to 'file' is standard for generic uploads.
  mediaUpload.single('file'),
  uploadController.uploadFile
);

/**
 * DELETE /api/upload
 * Delete a file by public_id
 * Body:
 * - public_id: string
 */
router.delete('/', authenticate, uploadController.deleteFile);

export default router;
