import type { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Define the interface for params since the library might have poor types
interface CloudinaryParams {
  folder?: string | ((req: Request, file: Express.Multer.File) => string);
  allowed_formats?: string[];
  public_id?: (req: Request, file: Express.Multer.File) => string;
  [key: string]: unknown;
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req: Request, _file: Express.Multer.File) => {
      // Allow folder override via query param, defaulting to 'uploads'
      // Sanitize the folder name to prevent directory traversal or weird characters
      const folderParam = req.query.folder as string;
      if (folderParam && /^[a-zA-Z0-9-_]+$/.test(folderParam)) {
        return folderParam;
      }
      return 'uploads';
    },
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (_req: Request, file: Express.Multer.File) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const originalName = file.originalname || 'file';

      const name = originalName.split('.')[0]?.replace(/[^a-zA-Z0-9]/g, '');
      return `${name}-${uniqueSuffix}`;
    },
  } as CloudinaryParams,
});

export const mediaUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
