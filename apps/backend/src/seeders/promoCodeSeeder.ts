import dotenv from 'dotenv';
import { PromoCode } from '../models/PromoCode.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const promoCodes = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers - 10% off',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderAmount: 10,
    maxDiscountAmount: 5,
    usageLimit: 1000,
    userUsageLimit: 1,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'SAVE20',
    description: 'Save 20% on orders over $25',
    discountType: 'percentage' as const,
    discountValue: 20,
    minOrderAmount: 25,
    maxDiscountAmount: 10,
    usageLimit: 500,
    userUsageLimit: 3,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'FREESHIP',
    description: 'Free delivery on orders over $15',
    discountType: 'fixed' as const,
    discountValue: 3,
    minOrderAmount: 15,
    usageLimit: 2000,
    userUsageLimit: 5,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'COFFEE5',
    description: '$5 off your coffee order',
    discountType: 'fixed' as const,
    discountValue: 5,
    minOrderAmount: 20,
    usageLimit: 300,
    userUsageLimit: 2,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'WEEKEND15',
    description: 'Weekend special - 15% off',
    discountType: 'percentage' as const,
    discountValue: 15,
    minOrderAmount: 15,
    maxDiscountAmount: 8,
    usageLimit: 1000,
    userUsageLimit: 1,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'LOYALTY25',
    description: 'Loyalty reward - 25% off for returning customers',
    discountType: 'percentage' as const,
    discountValue: 25,
    minOrderAmount: 30,
    maxDiscountAmount: 15,
    usageLimit: 200,
    userUsageLimit: 1,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'FIRSTORDER',
    description: '$10 off your first order',
    discountType: 'fixed' as const,
    discountValue: 10,
    minOrderAmount: 25,
    usageLimit: 5000,
    userUsageLimit: 1,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    isActive: true,
  },
  {
    code: 'EXPIRED50',
    description: 'Expired promo code for testing',
    discountType: 'percentage' as const,
    discountValue: 50,
    minOrderAmount: 10,
    maxDiscountAmount: 20,
    usageLimit: 100,
    userUsageLimit: 1,
    validFrom: new Date('2023-01-01'),
    validUntil: new Date('2023-12-31'),
    isActive: false,
  },
];

const seedPromoCodes = async () => {
  try {
    await connectDB();

    // Clear existing promo codes
    await PromoCode.deleteMany({});
    console.log('Cleared existing promo codes');

    // Insert new promo codes
    const createdPromoCodes = await PromoCode.create(promoCodes);
    console.log(
      `✅ Successfully seeded ${createdPromoCodes.length} promo codes`
    );

    // Display created promo codes
    console.log('\n📋 Promo Codes:');
    createdPromoCodes.forEach((promo) => {
      const status = promo.isActive ? '✓ Active' : '✗ Inactive';
      const type =
        promo.discountType === 'percentage'
          ? `${promo.discountValue}%`
          : `$${promo.discountValue}`;
      console.log(`  - ${promo.code} (${type}) - ${status}`);
      console.log(`    ${promo.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding promo codes:', error);
    process.exit(1);
  }
};

seedPromoCodes();
