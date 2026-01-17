import type { Request, Response } from 'express';
import { uploadService } from '../services/uploadService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const result = await uploadService.uploadImage(req.file);

  res
    .status(200)
    .json(new ApiResponse(200, result, 'File uploaded successfully'));
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { public_id } = req.body;
  if (!public_id) {
    throw new BadRequestError('public_id is required');
  }

  await uploadService.deleteImage(public_id);
  res.status(200).json(new ApiResponse(200, null, 'File deleted successfully'));
});
