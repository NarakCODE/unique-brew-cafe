import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Store } from '../models/Store.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

interface CategoryData {
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

const categoriesData: CategoryData[] = [
  {
    name: 'Hot Coffee',
    description: 'Freshly brewed hot coffee beverages',
    icon: '☕',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Iced Coffee',
    description: 'Refreshing cold coffee drinks',
    icon: '🧊',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Espresso',
    description: 'Classic espresso-based drinks',
    icon: '☕',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Specialty Drinks',
    description: 'Unique and seasonal beverages',
    icon: '✨',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Tea',
    description: 'Hot and iced tea selections',
    icon: '🍵',
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Smoothies',
    description: 'Fruit and protein smoothies',
    icon: '🥤',
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Pastries',
    description: 'Fresh baked goods and pastries',
    icon: '🥐',
    displayOrder: 7,
    isActive: true,
  },
  {
    name: 'Sandwiches',
    description: 'Breakfast and lunch sandwiches',
    icon: '🥪',
    displayOrder: 8,
    isActive: true,
  },
];

const seedCategories = async () => {
  try {
    await connectDB();

    // Get the default store (required for categories)
    const store = await Store.findOne({});
    if (!store) {
      console.error(
        '❌ No store found. Please run the store seeder first: pnpm seed:store'
      );
      process.exit(1);
    }

    const storeId = store._id as mongoose.Types.ObjectId;
    console.log(`Using store: ${store.name} (${storeId})`);

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Add storeId to each category
    const categoriesWithStore = categoriesData.map((cat) => ({
      ...cat,
      storeId,
    }));

    // Insert new categories (using create to trigger pre-save hooks)
    const createdCategories = await Category.create(categoriesWithStore);
    console.log(
      `✅ Successfully seeded ${createdCategories.length} categories`
    );

    // Display created categories
    createdCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
