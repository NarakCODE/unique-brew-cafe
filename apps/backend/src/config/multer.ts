import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/AppError.js';

// Configure storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
    // For now, store in uploads directory
    cb(null, 'uploads/avatars');
  },
  filename: function (_req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to accept only images
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestError('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
