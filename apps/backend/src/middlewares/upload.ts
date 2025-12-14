import type { Request } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'stores',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (_req: Request, file: Express.Multer.File) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const name = file.originalname.split('.')[0];
      return `${name}-${uniqueSuffix}`;
    },
  } as Record<string, unknown>,
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
