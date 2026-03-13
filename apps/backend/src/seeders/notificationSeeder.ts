import dotenv from 'dotenv';
import Notification from '../models/Notification.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/database.js';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const seedNotifications = async () => {
  try {
    await connectDB();

    // Find a regular user or admin user to seed notifications
    const user =
      (await User.findOne({
        email: process.env.ADMIN_EMAIL || 'channarakluy@gmail.com',
      })) ||
      (await User.findOne({ role: 'admin' })) ||
      (await User.findOne({
        email: { $ne: 'deleted_1768147029217@deleted.com' },
      }));

    if (!user) {
      console.log(
        '⚠️ No users found in the database. Please seed users first (e.g., using seed:admin or signing up).'
      );
      process.exit(1);
    }

    const userId = user._id;

    const mockNotifications = [
      {
        userId,
        type: 'order_status',
        title: 'Your order is ready for pickup! ☕️',
        message:
          'Order #UB-4921 has been prepared and is waiting for you at the counter.',
        imageUrl:
          'https://uniquebrewcafe.com/images/notifications/coffee-ready.png',
        actionType: 'order_details',
        actionValue: new mongoose.Types.ObjectId().toString(), // Dummy order ID
        priority: 'high',
        isRead: false,
      },
      {
        userId,
        type: 'promotion',
        title: 'Buy 1 Get 1 Free on all Lattes! 🎉',
        message:
          'Happy Hour is here! Visit us between 2 PM and 4 PM today to grab this offer.',
        imageUrl:
          'https://uniquebrewcafe.com/images/notifications/bogo-latte.png',
        actionType: 'promotion',
        actionValue: 'PROMO_HAPPYHOUR',
        priority: 'medium',
        isRead: true,
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId,
        type: 'announcement',
        title: 'New Fall Menu is Live! 🍂',
        message:
          'Pumpkin Spice and Maple Pecan are back. Check out our seasonal additions inside.',
        imageUrl:
          'https://uniquebrewcafe.com/images/notifications/fall-menu.png',
        actionType: 'external_url',
        actionValue: 'https://uniquebrewcafe.com/menu/seasonal',
        priority: 'medium',
        isRead: true,
        readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId,
        type: 'system',
        title: 'Welcome to Unique Brew Cafe! ☕',
        message:
          "Thank you for joining our community! Don't forget to set up your profile to start earning loyalty points.",
        imageUrl: 'https://uniquebrewcafe.com/images/notifications/welcome.png',
        actionType: 'none',
        priority: 'low',
        isRead: true,
        readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];

    // Optional: Delete existing mock notifications to avoid duplicates over time
    await Notification.deleteMany({ userId });

    // Insert mock notifications
    const created = await Notification.create(mockNotifications);

    console.log(
      `✅ Successfully seeded ${created.length} mock notifications for user ${user.email}`
    );
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
