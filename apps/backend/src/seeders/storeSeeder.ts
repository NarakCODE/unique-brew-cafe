import dotenv from 'dotenv';
import { Store } from '../models/Store.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const defaultStore = {
  name: 'Unique Brew Café',
  slug: 'unique-brew-cafe',
  description:
    'Your neighborhood specialty coffee shop serving premium coffee and delicious pastries.',
  address: '123 Coffee Street',
  city: 'Phnom Penh',
  state: 'Phnom Penh',
  postalCode: '12000',
  country: 'Cambodia',
  phone: '+855 12 345 678',
  email: 'hello@uniquebrew.cafe',
  latitude: 11.5564,
  longitude: 104.9282,
  imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
  images: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  ],
  openingHours: {
    monday: { open: '07:00', close: '21:00' },
    tuesday: { open: '07:00', close: '21:00' },
    wednesday: { open: '07:00', close: '21:00' },
    thursday: { open: '07:00', close: '21:00' },
    friday: { open: '07:00', close: '22:00' },
    saturday: { open: '08:00', close: '22:00' },
    sunday: { open: '08:00', close: '20:00' },
  },
  isOpen: true,
  isActive: true,
  averagePrepTime: 15,
  rating: 4.8,
  totalReviews: 256,
  features: {
    parking: true,
    wifi: true,
    outdoorSeating: true,
    driveThrough: false,
  },
};

const seedStore = async () => {
  try {
    await connectDB();

    // Check if store already exists
    const existingStore = await Store.findOne({ slug: defaultStore.slug });

    if (existingStore) {
      console.log(`⚠️  Store already exists: ${existingStore.name}`);
      console.log(`  ID: ${existingStore._id}`);
      process.exit(0);
    }

    // Create the default store
    const createdStore = await Store.create(defaultStore);
    console.log('✅ Successfully created default store');
    console.log(`  Name: ${createdStore.name}`);
    console.log(`  ID: ${createdStore._id}`);
    console.log(`  Address: ${createdStore.address}, ${createdStore.city}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding store:', error);
    process.exit(1);
  }
};

seedStore();
