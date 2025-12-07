import type { Request, Response } from 'express';
import { announcementService } from '../services/announcementService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/AppError.js';

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

    res.status(201).json({
      success: true,
      data: announcement,
    });
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

    res.status(200).json({
      success: true,
      data: announcement,
    });
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

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
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

    res.status(200).json({
      success: true,
      data: announcement,
      message: `Announcement ${
        announcement.isActive ? 'published' : 'unpublished'
      } successfully`,
    });
  }
);

/**
 * Get active announcements
 * GET /announcements
 */
export const getAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    // req.userId might be undefined if guest, which is handled by service
    const announcements = await announcementService.getActiveAnnouncements(
      req.userId
    );

    res.status(200).json({
      success: true,
      data: announcements,
    });
  }
);

/**
 * Get admin announcements
 * GET /admin/announcements
 */
export const getAdminAnnouncements = asyncHandler(
  async (req: Request, res: Response) => {
    const adminAnnouncements = await announcementService.getAdminAnnouncements(
      req.userId
    );

    res.status(200).json({
      success: true,
      data: adminAnnouncements,
    });
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

    res.status(200).json({
      success: true,
      data: announcement,
    });
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

  res.status(200).json({
    success: true,
    message: 'View tracked',
  });
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

  res.status(200).json({
    success: true,
    message: 'Click tracked',
  });
});
