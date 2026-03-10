import type { FilterQuery } from 'mongoose';
import Announcement, { type IAnnouncement } from '../models/Announcement.js';
import { NotFoundError } from '../utils/AppError.js';
import { User } from '../models/User.js';

// Base DTO for shared fields
interface BaseAnnouncementDTO {
  title: string;
  description: string;
  imageUrl?: string;
  actionType?: 'promo_code' | 'deep_link' | 'external_url' | 'none';
  actionValue?: string;
  priority?: number;
  targetAudience?: 'all' | 'new_users' | 'loyal_users' | 'specific_tier';
  userTierFilter?: string[];
  startDate?: Date;
  endDate: Date;
  isActive?: boolean;
}

// Create needs specific required fields (title, description, endDate implied by Base)
// We redefine specific 'optional' vs 'required' nuances if needed, but Base matches the previous Create DTO structure exactly.
export type CreateAnnouncementDTO = BaseAnnouncementDTO;

// Update is strictly partial of the base
export type UpdateAnnouncementDTO = Partial<BaseAnnouncementDTO>;

export const announcementService = {
  /**
   * Create a new announcement
   */
  async createAnnouncement(
    data: CreateAnnouncementDTO
  ): Promise<IAnnouncement> {
    const announcement = await Announcement.create(data);
    return announcement;
  },

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementDTO
  ): Promise<IAnnouncement> {
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const result = await Announcement.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Announcement not found');
    }
  },

  /**
   * Toggle publish status of an announcement
   */
  async togglePublish(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    announcement.isActive = !announcement.isActive;
    await announcement.save();

    return announcement;
  },

  /**
   * Get active announcements for a user (or guest)
   */

  async getActiveAnnouncements(userId?: string): Promise<IAnnouncement[]> {
    const query: FilterQuery<IAnnouncement> = {
      isActive: true,
    };

    if (!userId) {
      query.targetAudience = 'all';
      return Announcement.find(query).sort({ priority: -1, createdAt: -1 });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      query.targetAudience = 'all';
      return Announcement.find(query).sort({ priority: -1, createdAt: -1 });
    }

    const audienceFilters: FilterQuery<IAnnouncement>[] = [
      { targetAudience: 'all' },
    ];

    const now = new Date();
    const accountAgeInMs = now.getTime() - new Date(user.createdAt).getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

    if (accountAgeInMs <= thirtyDaysInMs) {
      audienceFilters.push({ targetAudience: 'new_users' });
    }

    if ((user.totalOrders ?? 0) > 0 || (user.loyaltyPoints ?? 0) > 0) {
      audienceFilters.push({ targetAudience: 'loyal_users' });
    }

    if (user.loyaltyTier) {
      audienceFilters.push({
        targetAudience: 'specific_tier',
        userTierFilter: user.loyaltyTier,
      });
    }

    query.$or = audienceFilters;

    return Announcement.find(query).sort({ priority: -1, createdAt: -1 });
  },

  /**
   * Get all announcements for admin users (no filtering)
   * Admin users can see all announcements regardless of status, date, or target audience
   */
  async getAdminAnnouncements(userId?: string): Promise<IAnnouncement[]> {
    if (!userId) {
      throw new NotFoundError('User ID is required for admin announcements');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify user has admin role
    if (user.role !== 'admin') {
      throw new NotFoundError('Access denied. Admin role required.');
    }

    // Return all announcements for admin to manage
    return Announcement.find({}).sort({ priority: -1, createdAt: -1 });
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string): Promise<IAnnouncement> {
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new NotFoundError('Announcement not found');
    }

    return announcement;
  },

  /**
   * Track view for an announcement
   */
  async trackView(id: string): Promise<void> {
    await Announcement.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  },

  /**
   * Track click for an announcement
   */
  async trackClick(id: string): Promise<void> {
    await Announcement.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
  },
};
