import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';

export interface UploadResponse {
  url: string;
  public_id: string;
  format: string;
  original_name: string;
  size: number;
}

export class UploadService {
  /**
   * Process uploaded file info
   * @param file ensure file is uploaded from middleware
   * @returns formatted response
   */
  public async uploadImage(file: Express.Multer.File): Promise<UploadResponse> {
    // In this setup, the file is already uploaded by multer-storage-cloudinary middleware.
    // This method mainly centralizes the response formatting and can be extended for other logic (e.g. DB logging).

    // Safety check if something went wrong with middleware
    if (!file.path || !file.filename) {
      throw new Error('File upload failed: missing path or filename');
    }

    return {
      url: file.path,
      public_id: file.filename,
      // multer-storage-cloudinary puts the format in file.mimetype or sometimes we deduce,
      // but commonly mimetype is "image/jpeg"
      format: file.mimetype,
      original_name: file.originalname,
      size: file.size,
    };
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url Cloudinary secure URL
   * @returns public_id or null
   */
  public getPublicIdFromUrl(url: string): string | null {
    if (!url) return null;
    const parts = url.split('/');
    const filename = parts.pop();
    if (!filename) return null;
    const publicId = filename.split('.')[0];
    // You might need to handle folders if they are part of public_id,
    // but usually Cloudinary returns a url where public_id extraction depends on configuration.
    // A better way if we have the full response is to store public_id, but the user asked to pass URL.
    // For now, this is a helper.
    return publicId || null;
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId Cloudinary public ID
   */
  public async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted image with public_id: ${publicId}`);
  }
}

export const uploadService = new UploadService();
