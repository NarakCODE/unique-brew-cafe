import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const adminUser = {
  fullName: 'System Administrator',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  role: 'admin' as const,
  emailVerified: true,
  phoneVerified: false,
  status: 'active' as const,
};

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminUser.email);

      // Update role if not admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }

      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminUser);
    console.log('✅ Successfully created admin user');
    console.log('  Email:', admin.email);
    console.log('  Role:', admin.role);
    console.log('  ID:', admin._id);
    console.log(
      '\n⚠️  IMPORTANT: Change the default password after first login!'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
