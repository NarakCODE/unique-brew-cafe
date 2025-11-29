import dotenv from 'dotenv';
import { AppConfig } from '../models/AppConfig.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const configs = [
  {
    configKey: 'app.version',
    configValue: '1.0.0',
    description: 'Current application version',
    isPublic: true,
    type: 'string' as const,
  },
  {
    configKey: 'app.maintenance_mode',
    configValue: false,
    description: 'Enable/disable maintenance mode',
    isPublic: true,
    type: 'boolean' as const,
  },
  {
    configKey: 'app.min_order_amount',
    configValue: 10,
    description: 'Minimum order amount in USD',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'app.tax_rate',
    configValue: 0.1,
    description: 'Tax rate as decimal (0.1 = 10%)',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'app.currency',
    configValue: 'USD',
    description: 'Default currency code',
    isPublic: true,
    type: 'string' as const,
  },
  {
    configKey: 'app.loyalty_points_rate',
    configValue: 1,
    description: 'Loyalty points earned per dollar spent',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'app.loyalty_points_value',
    configValue: 0.01,
    description: 'Dollar value of each loyalty point',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'payment.methods',
    configValue: ['card', 'aba', 'acleda', 'wing', 'cash'],
    description: 'Available payment methods',
    isPublic: true,
    type: 'json' as const,
  },
  {
    configKey: 'payment.card_enabled',
    configValue: true,
    description: 'Enable credit/debit card payments',
    isPublic: true,
    type: 'boolean' as const,
  },
  {
    configKey: 'payment.cash_enabled',
    configValue: true,
    description: 'Enable cash on delivery',
    isPublic: true,
    type: 'boolean' as const,
  },
  {
    configKey: 'delivery.base_fee',
    configValue: 2.5,
    description: 'Base delivery fee in USD',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'delivery.per_km_fee',
    configValue: 0.5,
    description: 'Additional fee per kilometer',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'delivery.free_delivery_threshold',
    configValue: 30,
    description: 'Order amount for free delivery',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'delivery.max_distance_km',
    configValue: 15,
    description: 'Maximum delivery distance in kilometers',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'order.cancellation_window_minutes',
    configValue: 5,
    description: 'Time window for order cancellation in minutes',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'order.preparation_time_buffer_minutes',
    configValue: 5,
    description: 'Additional buffer time for order preparation',
    isPublic: false,
    type: 'number' as const,
  },
  {
    configKey: 'order.auto_complete_hours',
    configValue: 24,
    description: 'Hours after which orders are auto-completed',
    isPublic: false,
    type: 'number' as const,
  },
  {
    configKey: 'cart.expiration_hours',
    configValue: 24,
    description: 'Hours before abandoned carts expire',
    isPublic: false,
    type: 'number' as const,
  },
  {
    configKey: 'checkout.session_expiration_minutes',
    configValue: 15,
    description: 'Checkout session expiration time in minutes',
    isPublic: true,
    type: 'number' as const,
  },
  {
    configKey: 'otp.expiration_minutes',
    configValue: 10,
    description: 'OTP expiration time in minutes',
    isPublic: false,
    type: 'number' as const,
  },
  {
    configKey: 'otp.max_attempts',
    configValue: 5,
    description: 'Maximum OTP verification attempts',
    isPublic: false,
    type: 'number' as const,
  },
  {
    configKey: 'support.email',
    configValue: 'support@cornercoffee.com',
    description: 'Support email address',
    isPublic: true,
    type: 'string' as const,
  },
  {
    configKey: 'support.phone',
    configValue: '+1-555-COFFEE',
    description: 'Support phone number',
    isPublic: true,
    type: 'string' as const,
  },
  {
    configKey: 'support.hours',
    configValue:
      'Monday-Friday: 8:00 AM - 8:00 PM, Saturday-Sunday: 9:00 AM - 6:00 PM',
    description: 'Support operating hours',
    isPublic: true,
    type: 'string' as const,
  },
  {
    configKey: 'features.loyalty_enabled',
    configValue: true,
    description: 'Enable loyalty points system',
    isPublic: true,
    type: 'boolean' as const,
  },
  {
    configKey: 'features.referral_enabled',
    configValue: true,
    description: 'Enable referral program',
    isPublic: true,
    type: 'boolean' as const,
  },
  {
    configKey: 'features.notifications_enabled',
    configValue: true,
    description: 'Enable push notifications',
    isPublic: true,
    type: 'boolean' as const,
  },
];

const seedAppConfig = async () => {
  try {
    await connectDB();

    // Clear existing configs
    await AppConfig.deleteMany({});
    console.log('Cleared existing app configurations');

    // Insert new configs
    const createdConfigs = await AppConfig.create(configs);
    console.log(
      `✅ Successfully seeded ${createdConfigs.length} app configurations`
    );

    // Display summary by category
    console.log('\n⚙️  Configuration Summary:');
    const categories = [
      'app',
      'payment',
      'delivery',
      'order',
      'cart',
      'checkout',
      'otp',
      'support',
      'features',
    ];

    categories.forEach((category) => {
      const categoryConfigs = createdConfigs.filter((config) =>
        config.configKey.startsWith(category + '.')
      );
      if (categoryConfigs.length > 0) {
        console.log(`\n  ${category.toUpperCase()}:`);
        categoryConfigs.forEach((config) => {
          const visibility = config.isPublic ? '🌐' : '🔒';
          console.log(
            `    ${visibility} ${config.configKey}: ${JSON.stringify(config.configValue)}`
          );
        });
      }
    });

    console.log('\n🌐 = Public configuration');
    console.log('🔒 = Private configuration');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding app configurations:', error);
    process.exit(1);
  }
};

seedAppConfig();
