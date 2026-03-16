import type { Request, Response } from 'express';
import { announcementService } from '../services/announcementService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Create a new announcement
 * POST /announcements
 */
export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, endDate } = req.body;

    if (!title || !description || !endDate) {
      throw new BadRequestError(
        'Title, description, and end date are required'
      );
    }

    const announcement = await announcementService.createAnnouncement(req.body);

    res
      .status(201)
      .json(
        new ApiResponse(201, announcement, 'Announcement created successfully')
      );
  }
);

/**
 * Update an announcement
 * PUT /announcements/:id
 */
export const updateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Announcement ID is required');
    }

    const announcement = await announcementService.updateAnnouncement(
      id,
      req.body
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, announcement, 'Announcement updated successfully')
      );
  }
);

/**
 * Delete an announcement
 * DELETE /announcements/:id
 */
export const deleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Announcement ID is required');
    }

    await announcementService.deleteAnnouncement(id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Announcement deleted successfully'));
  }
);

/**
 * Toggle publish status
 * PATCH /announcements/:id/publish
 */
export const togglePublish = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Announcement ID is required');
    }

    const announcement = await announcementService.togglePublish(id);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          announcement,
          `Announcement ${
            announcement.isActive ? 'published' : 'unpublished'
          } successfully`
        )
      );
  }
);

/**
 * Get active announcements
 * GET /announcements
 */
export const getAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    // req.userId might be undefined if guest, which is handled by service
    const result = await announcementService.getActiveAnnouncements(
      req.userId,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Active announcements fetched successfully'
        )
      );
  }
);

/**
 * Get admin announcements
 * GET /admin/announcements
 */
export const getAdminAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await announcementService.getAdminAnnouncements(
      req.userId,
      paginationParams
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { items: result.data, pagination: result.pagination },
          'Admin announcements fetched successfully'
        )
      );
  }
);

/**
 * Get announcement details
 * GET /announcements/:id
 */
export const getAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Announcement ID is required');
    }

    const announcement = await announcementService.getAnnouncementById(id);

    res
      .status(200)
      .json(
        new ApiResponse(200, announcement, 'Announcement fetched successfully')
      );
  }
);

/**
 * Track announcement view
 * POST /announcements/:id/view
 */
export const trackView = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Announcement ID is required');
  }

  await announcementService.trackView(id);

  res.status(200).json(new ApiResponse(200, null, 'View tracked'));
});

/**
 * Track announcement click
 * POST /announcements/:id/click
 */
export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Announcement ID is required');
  }

  await announcementService.trackClick(id);

  res.status(200).json(new ApiResponse(200, null, 'Click tracked'));
});
