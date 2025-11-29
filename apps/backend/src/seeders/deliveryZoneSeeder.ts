import dotenv from 'dotenv';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const deliveryZones = [
  {
    name: 'Downtown Core',
    deliveryFee: 2.5,
    minOrderAmount: 10,
    estimatedDeliveryTime: '20-30 minutes',
    isActive: true,
    // Approximate polygon for downtown area (example coordinates)
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4194, 37.7749], // San Francisco example coordinates
          [-122.4094, 37.7749],
          [-122.4094, 37.7849],
          [-122.4194, 37.7849],
          [-122.4194, 37.7749], // Close the polygon
        ],
      ],
    },
  },
  {
    name: 'North District',
    deliveryFee: 3.5,
    minOrderAmount: 12,
    estimatedDeliveryTime: '30-40 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4194, 37.7849],
          [-122.4094, 37.7849],
          [-122.4094, 37.7949],
          [-122.4194, 37.7949],
          [-122.4194, 37.7849],
        ],
      ],
    },
  },
  {
    name: 'South District',
    deliveryFee: 3.5,
    minOrderAmount: 12,
    estimatedDeliveryTime: '30-40 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4194, 37.7649],
          [-122.4094, 37.7649],
          [-122.4094, 37.7749],
          [-122.4194, 37.7749],
          [-122.4194, 37.7649],
        ],
      ],
    },
  },
  {
    name: 'East District',
    deliveryFee: 4.0,
    minOrderAmount: 15,
    estimatedDeliveryTime: '35-45 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4094, 37.7649],
          [-122.3994, 37.7649],
          [-122.3994, 37.7849],
          [-122.4094, 37.7849],
          [-122.4094, 37.7649],
        ],
      ],
    },
  },
  {
    name: 'West District',
    deliveryFee: 4.0,
    minOrderAmount: 15,
    estimatedDeliveryTime: '35-45 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4294, 37.7649],
          [-122.4194, 37.7649],
          [-122.4194, 37.7849],
          [-122.4294, 37.7849],
          [-122.4294, 37.7649],
        ],
      ],
    },
  },
  {
    name: 'Suburban Area',
    deliveryFee: 5.0,
    minOrderAmount: 20,
    estimatedDeliveryTime: '45-60 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.4394, 37.7549],
          [-122.3894, 37.7549],
          [-122.3894, 37.8049],
          [-122.4394, 37.8049],
          [-122.4394, 37.7549],
        ],
      ],
    },
  },
  {
    name: 'Airport Zone',
    deliveryFee: 6.0,
    minOrderAmount: 25,
    estimatedDeliveryTime: '50-70 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.3894, 37.6149],
          [-122.3694, 37.6149],
          [-122.3694, 37.6349],
          [-122.3894, 37.6349],
          [-122.3894, 37.6149],
        ],
      ],
    },
  },
  {
    name: 'University Campus',
    deliveryFee: 2.0,
    minOrderAmount: 8,
    estimatedDeliveryTime: '15-25 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.2594, 37.8719],
          [-122.2494, 37.8719],
          [-122.2494, 37.8819],
          [-122.2594, 37.8819],
          [-122.2594, 37.8719],
        ],
      ],
    },
  },
  {
    name: 'Business Park',
    deliveryFee: 3.0,
    minOrderAmount: 10,
    estimatedDeliveryTime: '25-35 minutes',
    isActive: true,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.0794, 37.3894],
          [-122.0694, 37.3894],
          [-122.0694, 37.3994],
          [-122.0794, 37.3994],
          [-122.0794, 37.3894],
        ],
      ],
    },
  },
  {
    name: 'Inactive Test Zone',
    deliveryFee: 10.0,
    minOrderAmount: 50,
    estimatedDeliveryTime: '90-120 minutes',
    isActive: false,
    coordinates: {
      type: 'Polygon' as const,
      coordinates: [
        [
          [-122.5, 37.5],
          [-122.49, 37.5],
          [-122.49, 37.51],
          [-122.5, 37.51],
          [-122.5, 37.5],
        ],
      ],
    },
  },
];

const seedDeliveryZones = async () => {
  try {
    await connectDB();

    // Clear existing delivery zones
    await DeliveryZone.deleteMany({});
    console.log('Cleared existing delivery zones');

    // Insert new delivery zones
    const createdZones = await DeliveryZone.create(deliveryZones);
    console.log(`✅ Successfully seeded ${createdZones.length} delivery zones`);

    // Display created zones
    console.log('\n🗺️  Delivery Zones:');
    const activeZones = createdZones.filter((zone) => zone.isActive);
    const inactiveZones = createdZones.filter((zone) => !zone.isActive);

    console.log('\n  Active Zones:');
    activeZones.forEach((zone) => {
      console.log(`    ✓ ${zone.name}`);
      console.log(
        `      Fee: $${zone.deliveryFee} | Min Order: $${zone.minOrderAmount}`
      );
      console.log(`      Estimated Time: ${zone.estimatedDeliveryTime}`);
    });

    if (inactiveZones.length > 0) {
      console.log('\n  Inactive Zones:');
      inactiveZones.forEach((zone) => {
        console.log(`    ✗ ${zone.name}`);
      });
    }

    console.log(
      `\n📊 Summary: ${activeZones.length} active, ${inactiveZones.length} inactive`
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding delivery zones:', error);
    process.exit(1);
  }
};

seedDeliveryZones();
