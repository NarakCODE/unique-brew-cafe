import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { announcementService } from '../../../src/services/announcementService';
import Announcement from '../../../src/models/Announcement';
import { User } from '../../../src/models/User';
import { NotFoundError } from '../../../src/utils/AppError';

// Mock dependencies
vi.mock('../../../src/models/Announcement');
vi.mock('../../../src/models/User');

describe('AnnouncementService', () => {
  const mockDate = new Date('2024-01-01T12:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
    // Freeze time for consistent date testing
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createAnnouncement', () => {
    it('should create an announcement successfully', async () => {
      const inputData = {
        title: 'New Promo',
        description: 'Get 50% off',
        startDate: mockDate,
        endDate: new Date(mockDate.getTime() + 86400000), // +1 day
      };

      const mockCreated = { ...inputData, _id: 'ann1' };
      (Announcement.create as any).mockResolvedValue(mockCreated);

      const result = await announcementService.createAnnouncement(
        inputData as any
      );

      expect(Announcement.create).toHaveBeenCalledWith(inputData);
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateAnnouncement', () => {
    it('should update and return the announcement if found', async () => {
      const updateData = { title: 'Updated Title' };
      const mockUpdated = { _id: 'ann1', ...updateData };

      (Announcement.findByIdAndUpdate as any).mockResolvedValue(mockUpdated);

      const result = await announcementService.updateAnnouncement(
        'ann1',
        updateData
      );

      expect(Announcement.findByIdAndUpdate).toHaveBeenCalledWith(
        'ann1',
        { $set: updateData },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdated);
    });

    it('should throw NotFoundError if announcement not found', async () => {
      (Announcement.findByIdAndUpdate as any).mockResolvedValue(null);

      await expect(
        announcementService.updateAnnouncement('invalid', { title: 'test' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete existing announcement', async () => {
      (Announcement.deleteOne as any).mockResolvedValue({ deletedCount: 1 });

      await announcementService.deleteAnnouncement('ann1');

      expect(Announcement.deleteOne).toHaveBeenCalledWith({ _id: 'ann1' });
    });

    it('should throw NotFoundError if nothing was deleted', async () => {
      (Announcement.deleteOne as any).mockResolvedValue({ deletedCount: 0 });

      await expect(
        announcementService.deleteAnnouncement('invalid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('togglePublish', () => {
    it('should toggle isActive status', async () => {
      const mockAnnouncement = {
        _id: 'ann1',
        isActive: true,
        save: vi.fn().mockResolvedValue(true),
      };

      (Announcement.findById as any).mockResolvedValue(mockAnnouncement);

      await announcementService.togglePublish('ann1');

      expect(mockAnnouncement.isActive).toBe(false);
      expect(mockAnnouncement.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if announcement not found', async () => {
      (Announcement.findById as any).mockResolvedValue(null);

      await expect(
        announcementService.togglePublish('invalid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getActiveAnnouncements', () => {
    it('should filter strictly for "all" audience for guest users (no userId)', async () => {
      // Mock chain: find().sort()
      const mockSort = vi.fn().mockResolvedValue([]);
      (Announcement.find as any).mockReturnValue({ sort: mockSort });

      await announcementService.getActiveAnnouncements();

      // Verify query includes targetAudience: 'all'
      expect(Announcement.find).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          targetAudience: 'all',
        })
      );
      expect(mockSort).toHaveBeenCalledWith({ priority: -1, createdAt: -1 });
    });

    it('should include matching audience filters for logged-in users', async () => {
      const userId = 'user123';
      (User.findById as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: userId,
          createdAt: new Date('2023-12-20T12:00:00Z'),
          loyaltyTier: 'gold',
          loyaltyPoints: 100,
          totalOrders: 3,
        }),
      });

      const mockSort = vi.fn().mockResolvedValue([]);
      (Announcement.find as any).mockReturnValue({ sort: mockSort });

      await announcementService.getActiveAnnouncements(userId);

      const callArgs = (Announcement.find as any).mock.calls[0][0];
      expect(callArgs.isActive).toBe(true);
      expect(callArgs.targetAudience).toBeUndefined();
      expect(callArgs.$or).toEqual(
        expect.arrayContaining([
          { targetAudience: 'all' },
          { targetAudience: 'new_users' },
          { targetAudience: 'loyal_users' },
          {
            targetAudience: 'specific_tier',
            userTierFilter: 'gold',
          },
        ])
      );
    });

    it('should treat user as guest if User ID provided does not exist in DB', async () => {
      const userId = 'nonExistent';
      (User.findById as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const mockSort = vi.fn().mockResolvedValue([]);
      (Announcement.find as any).mockReturnValue({ sort: mockSort });

      await announcementService.getActiveAnnouncements(userId);

      const callArgs = (Announcement.find as any).mock.calls[0][0];
      expect(callArgs.targetAudience).toBe('all');
    });

    it('should keep logged-in users limited to all announcements when they do not match extra audiences', async () => {
      const userId = 'user456';
      (User.findById as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: userId,
          createdAt: new Date('2023-01-01T12:00:00Z'),
          loyaltyTier: 'bronze',
          loyaltyPoints: 0,
          totalOrders: 0,
        }),
      });

      const mockSort = vi.fn().mockResolvedValue([]);
      (Announcement.find as any).mockReturnValue({ sort: mockSort });

      await announcementService.getActiveAnnouncements(userId);

      const callArgs = (Announcement.find as any).mock.calls[0][0];
      expect(callArgs.$or).toEqual(
        expect.arrayContaining([
          { targetAudience: 'all' },
          {
            targetAudience: 'specific_tier',
            userTierFilter: 'bronze',
          },
        ])
      );
      expect(callArgs.$or).toHaveLength(2);
    });
  });

  describe('getAnnouncementById', () => {
    it('should return announcement if found', async () => {
      const mockAnn = { _id: 'ann1', title: 'Test' };
      (Announcement.findById as any).mockResolvedValue(mockAnn);

      const result = await announcementService.getAnnouncementById('ann1');
      expect(result).toEqual(mockAnn);
    });

    it('should throw NotFoundError if not found', async () => {
      (Announcement.findById as any).mockResolvedValue(null);
      await expect(
        announcementService.getAnnouncementById('invalid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Metrics Tracking', () => {
    it('should increment view count', async () => {
      (Announcement.findByIdAndUpdate as any).mockResolvedValue({});

      await announcementService.trackView('ann1');

      expect(Announcement.findByIdAndUpdate).toHaveBeenCalledWith('ann1', {
        $inc: { viewCount: 1 },
      });
    });

    it('should increment click count', async () => {
      (Announcement.findByIdAndUpdate as any).mockResolvedValue({});

      await announcementService.trackClick('ann1');

      expect(Announcement.findByIdAndUpdate).toHaveBeenCalledWith('ann1', {
        $inc: { clickCount: 1 },
      });
    });
  });
});
