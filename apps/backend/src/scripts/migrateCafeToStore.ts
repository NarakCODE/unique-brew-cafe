import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Store } from '../models/Store.js';

interface LegacyCafeDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    country?: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email?: string;
  imageUrl?: string;
  operatingHours: Record<
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday',
    { open: string; close: string } | undefined
  >;
  specialHours?: Array<{
    date: string;
    open: string;
    close: string;
    reason?: string;
  }>;
  isOpen?: boolean;
  isActive?: boolean;
  averagePrepTime?: number;
  rating?: number;
  totalReviews?: number;
  features?: {
    parking?: boolean;
    wifi?: boolean;
    outdoorSeating?: boolean;
    driveThrough?: boolean;
  };
  managerId?: mongoose.Types.ObjectId;
}

const dayKeys = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

async function migrateCafeToStore(): Promise<void> {
  await mongoose.connect(config.mongoUri);

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection is not initialized');
    }

    const cafes = (await db
      .collection('cafes')
      .find({})
      .toArray()) as unknown as LegacyCafeDoc[];

    if (cafes.length === 0) {
      console.log('No legacy cafes found. Nothing to migrate.');
      return;
    }

    let migratedCount = 0;

    for (const cafe of cafes) {
      const openingHours = dayKeys.reduce(
        (acc, day) => {
          const hours = cafe.operatingHours?.[day];
          acc[day] = hours
            ? { open: hours.open, close: hours.close }
            : { open: '', close: '' };
          return acc;
        },
        {} as Record<
          (typeof dayKeys)[number],
          {
            open: string;
            close: string;
          }
        >
      );

      const mergedAddress = [
        cafe.address?.street,
        cafe.address?.city,
        cafe.address?.state,
      ]
        .filter(Boolean)
        .join(', ');

      await Store.updateOne(
        { slug: cafe.slug },
        {
          $set: {
            name: cafe.name,
            slug: cafe.slug,
            description: cafe.description,
            address: mergedAddress,
            city: cafe.address?.city || 'Unknown',
            state: cafe.address?.state || 'Unknown',
            postalCode: cafe.address?.postalCode,
            country: cafe.address?.country || 'Cambodia',
            phone: cafe.phone,
            email: cafe.email,
            latitude: cafe.coordinates?.latitude,
            longitude: cafe.coordinates?.longitude,
            imageUrl: cafe.imageUrl,
            openingHours,
            specialHours: (cafe.specialHours || []).map((item) => ({
              date: new Date(item.date),
              open: item.open,
              close: item.close,
              reason: item.reason,
            })),
            isOpen: cafe.isOpen ?? true,
            isActive: cafe.isActive ?? true,
            averagePrepTime: cafe.averagePrepTime ?? 15,
            rating: cafe.rating,
            totalReviews: cafe.totalReviews ?? 0,
            features: {
              parking: cafe.features?.parking ?? false,
              wifi: cafe.features?.wifi ?? false,
              outdoorSeating: cafe.features?.outdoorSeating ?? false,
              driveThrough: cafe.features?.driveThrough ?? false,
            },
            managerId: cafe.managerId,
          },
        },
        { upsert: true }
      );

      migratedCount += 1;
    }

    console.log(`Cafe -> Store migration complete. Migrated ${migratedCount}.`);
  } finally {
    await mongoose.connection.close();
  }
}

migrateCafeToStore().catch((error) => {
  console.error('Cafe -> Store migration failed:', error);
  process.exit(1);
});
