import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ProductCustomization } from '../models/ProductCustomization.js';
import { AddOn } from '../models/AddOn.js';
import { ProductAddOn } from '../models/ProductAddOn.js';
import { Category } from '../models/Category.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

// Add-ons data
const addOnsData = [
  // Syrups
  {
    name: 'Vanilla Syrup',
    description: 'Classic vanilla flavor',
    price: 0.5,
    category: 'syrup',
    isAvailable: true,
  },
  {
    name: 'Caramel Syrup',
    description: 'Sweet caramel flavor',
    price: 0.5,
    category: 'syrup',
    isAvailable: true,
  },
  {
    name: 'Hazelnut Syrup',
    description: 'Nutty hazelnut flavor',
    price: 0.5,
    category: 'syrup',
    isAvailable: true,
  },
  {
    name: 'Mocha Syrup',
    description: 'Rich chocolate flavor',
    price: 0.5,
    category: 'syrup',
    isAvailable: true,
  },
  // Toppings
  {
    name: 'Whipped Cream',
    description: 'Light and fluffy whipped cream',
    price: 0.75,
    category: 'topping',
    isAvailable: true,
  },
  {
    name: 'Chocolate Drizzle',
    description: 'Rich chocolate sauce',
    price: 0.5,
    category: 'topping',
    isAvailable: true,
  },
  {
    name: 'Caramel Drizzle',
    description: 'Sweet caramel sauce',
    price: 0.5,
    category: 'topping',
    isAvailable: true,
  },
  // Extra shots
  {
    name: 'Extra Espresso Shot',
    description: 'Additional shot of espresso',
    price: 1.0,
    category: 'extra_shot',
    isAvailable: true,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await ProductCustomization.deleteMany({});
    await AddOn.deleteMany({});
    await ProductAddOn.deleteMany({});
    console.log('Cleared existing products, customizations, and add-ons');

    // Get categories
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.error(
        '❌ No categories found. Please run category seeder first.'
      );
      process.exit(1);
    }

    const categoryMap = new Map(
      categories.map((cat) => [cat.name, cat._id as mongoose.Types.ObjectId])
    );

    // Seed add-ons first
    const createdAddOns = await AddOn.create(addOnsData);
    console.log(`✅ Seeded ${createdAddOns.length} add-ons`);

    // Products data
    const productsData = [
      // Hot Coffee
      {
        name: 'Classic Americano',
        description:
          'Rich espresso shots topped with hot water for a smooth, bold taste',
        categoryId: categoryMap.get('Hot Coffee'),
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
        ],
        basePrice: 3.5,
        preparationTime: 3,
        calories: 10,
        rating: 4.5,
        totalReviews: 128,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: true,
        allergens: [],
        tags: ['hot', 'espresso', 'classic'],
        displayOrder: 1,
      },
      {
        name: 'Cappuccino',
        description:
          'Espresso with steamed milk and a thick layer of milk foam',
        categoryId: categoryMap.get('Hot Coffee'),
        images: [
          'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
        ],
        basePrice: 4.0,
        preparationTime: 4,
        calories: 120,
        rating: 4.7,
        totalReviews: 256,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: true,
        allergens: ['milk'],
        tags: ['hot', 'espresso', 'milk'],
        displayOrder: 2,
      },
      {
        name: 'Caffe Latte',
        description: 'Smooth espresso with steamed milk and light foam',
        categoryId: categoryMap.get('Hot Coffee'),
        images: ['https://images.unsplash.com/photo-1561882468-9110e03e0f78'],
        basePrice: 4.25,
        preparationTime: 4,
        calories: 150,
        rating: 4.6,
        totalReviews: 189,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: true,
        allergens: ['milk'],
        tags: ['hot', 'espresso', 'milk', 'creamy'],
        displayOrder: 3,
      },
      // Iced Coffee
      {
        name: 'Iced Americano',
        description: 'Espresso shots over ice with cold water',
        categoryId: categoryMap.get('Iced Coffee'),
        images: [
          'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
        ],
        basePrice: 3.75,
        preparationTime: 3,
        calories: 10,
        rating: 4.4,
        totalReviews: 95,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: true,
        allergens: [],
        tags: ['iced', 'espresso', 'refreshing'],
        displayOrder: 1,
      },
      {
        name: 'Iced Latte',
        description: 'Espresso with cold milk over ice',
        categoryId: categoryMap.get('Iced Coffee'),
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6',
        ],
        basePrice: 4.5,
        preparationTime: 4,
        calories: 140,
        rating: 4.8,
        totalReviews: 312,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: true,
        allergens: ['milk'],
        tags: ['iced', 'espresso', 'milk', 'creamy'],
        displayOrder: 2,
      },
      {
        name: 'Cold Brew',
        description: 'Smooth, naturally sweet coffee steeped for 20 hours',
        categoryId: categoryMap.get('Iced Coffee'),
        images: [
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
        ],
        basePrice: 4.0,
        preparationTime: 2,
        calories: 5,
        rating: 4.6,
        totalReviews: 178,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: false,
        allergens: [],
        tags: ['iced', 'cold-brew', 'smooth'],
        displayOrder: 3,
      },
      // Espresso
      {
        name: 'Single Espresso',
        description: 'One shot of rich, bold espresso',
        categoryId: categoryMap.get('Espresso'),
        images: [
          'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04',
        ],
        basePrice: 2.5,
        preparationTime: 2,
        calories: 5,
        rating: 4.5,
        totalReviews: 67,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: false,
        allergens: [],
        tags: ['espresso', 'strong', 'classic'],
        displayOrder: 1,
      },
      {
        name: 'Double Espresso',
        description: 'Two shots of rich, bold espresso',
        categoryId: categoryMap.get('Espresso'),
        images: [
          'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04',
        ],
        basePrice: 3.5,
        preparationTime: 2,
        calories: 10,
        rating: 4.6,
        totalReviews: 89,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: false,
        allergens: [],
        tags: ['espresso', 'strong', 'classic'],
        displayOrder: 2,
      },
      {
        name: 'Macchiato',
        description: 'Espresso marked with a dollop of foamed milk',
        categoryId: categoryMap.get('Espresso'),
        images: ['https://images.unsplash.com/photo-1557006021-b85faa2bc5e2'],
        basePrice: 3.75,
        preparationTime: 3,
        calories: 15,
        rating: 4.4,
        totalReviews: 54,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: false,
        allergens: ['milk'],
        tags: ['espresso', 'milk', 'classic'],
        displayOrder: 3,
      },
      // Specialty Drinks
      {
        name: 'Caramel Macchiato',
        description: 'Vanilla-flavored latte with caramel drizzle and espresso',
        categoryId: categoryMap.get('Specialty Drinks'),
        images: [
          'https://images.unsplash.com/photo-1599639957043-f3aa5c986398',
        ],
        basePrice: 5.25,
        preparationTime: 5,
        calories: 250,
        rating: 4.9,
        totalReviews: 421,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: true,
        allergens: ['milk'],
        tags: ['specialty', 'sweet', 'caramel', 'vanilla'],
        displayOrder: 1,
      },
      {
        name: 'Mocha',
        description: 'Rich chocolate and espresso with steamed milk',
        categoryId: categoryMap.get('Specialty Drinks'),
        images: [
          'https://images.unsplash.com/photo-1578374173703-26bf6f8e3a4f',
        ],
        basePrice: 4.75,
        preparationTime: 5,
        calories: 290,
        rating: 4.7,
        totalReviews: 267,
        isAvailable: true,
        isFeatured: true,
        isBestSelling: true,
        allergens: ['milk'],
        tags: ['specialty', 'chocolate', 'sweet'],
        displayOrder: 2,
      },
      {
        name: 'White Chocolate Mocha',
        description: 'White chocolate sauce with espresso and steamed milk',
        categoryId: categoryMap.get('Specialty Drinks'),
        images: ['https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed'],
        basePrice: 5.0,
        preparationTime: 5,
        calories: 310,
        rating: 4.6,
        totalReviews: 198,
        isAvailable: true,
        isFeatured: false,
        isBestSelling: false,
        allergens: ['milk'],
        tags: ['specialty', 'chocolate', 'sweet', 'white-chocolate'],
        displayOrder: 3,
      },
    ];

    // Create products
    const createdProducts = await Product.create(productsData);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    // Create customizations for each product
    const customizationsData = [];

    for (const product of createdProducts) {
      // Size customization (for all drinks)
      customizationsData.push({
        productId: product._id,
        customizationType: 'size',
        options: [
          {
            id: 'small',
            name: 'Small (8oz)',
            priceModifier: 0,
            isDefault: false,
          },
          {
            id: 'medium',
            name: 'Medium (12oz)',
            priceModifier: 0,
            isDefault: true,
          },
          {
            id: 'large',
            name: 'Large (16oz)',
            priceModifier: 1.0,
            isDefault: false,
          },
        ],
        isRequired: true,
        displayOrder: 1,
      });

      // Sugar level (for all drinks)
      customizationsData.push({
        productId: product._id,
        customizationType: 'sugar_level',
        options: [
          {
            id: 'no_sugar',
            name: 'No Sugar',
            priceModifier: 0,
            isDefault: false,
          },
          {
            id: 'less_sugar',
            name: 'Less Sugar',
            priceModifier: 0,
            isDefault: false,
          },
          { id: 'regular', name: 'Regular', priceModifier: 0, isDefault: true },
          {
            id: 'extra_sugar',
            name: 'Extra Sugar',
            priceModifier: 0,
            isDefault: false,
          },
        ],
        isRequired: false,
        displayOrder: 2,
      });

      // Ice level (for iced drinks only)
      if (product.tags.includes('iced')) {
        customizationsData.push({
          productId: product._id,
          customizationType: 'ice_level',
          options: [
            {
              id: 'no_ice',
              name: 'No Ice',
              priceModifier: 0,
              isDefault: false,
            },
            {
              id: 'less_ice',
              name: 'Less Ice',
              priceModifier: 0,
              isDefault: false,
            },
            {
              id: 'regular',
              name: 'Regular Ice',
              priceModifier: 0,
              isDefault: true,
            },
            {
              id: 'extra_ice',
              name: 'Extra Ice',
              priceModifier: 0,
              isDefault: false,
            },
          ],
          isRequired: false,
          displayOrder: 3,
        });
      }

      // Coffee level (for espresso-based drinks)
      if (product.tags.includes('espresso')) {
        customizationsData.push({
          productId: product._id,
          customizationType: 'coffee_level',
          options: [
            { id: 'decaf', name: 'Decaf', priceModifier: 0, isDefault: false },
            {
              id: 'regular',
              name: 'Regular',
              priceModifier: 0,
              isDefault: true,
            },
            {
              id: 'extra_shot',
              name: 'Extra Shot',
              priceModifier: 1.0,
              isDefault: false,
            },
          ],
          isRequired: false,
          displayOrder: 4,
        });
      }
    }

    const createdCustomizations =
      await ProductCustomization.create(customizationsData);
    console.log(`✅ Seeded ${createdCustomizations.length} customizations`);

    // Link add-ons to products
    const productAddOnsData = [];
    const syrupAddOns = createdAddOns.filter((a) => a.category === 'syrup');
    const toppingAddOns = createdAddOns.filter((a) => a.category === 'topping');
    const extraShotAddOn = createdAddOns.find(
      (a) => a.name === 'Extra Espresso Shot'
    );

    for (const product of createdProducts) {
      // Add syrups to all drinks
      for (const syrup of syrupAddOns) {
        productAddOnsData.push({
          productId: product._id,
          addOnId: syrup._id,
          isDefault: false,
        });
      }

      // Add toppings to specialty drinks and lattes
      if (
        product.tags.includes('specialty') ||
        product.name.toLowerCase().includes('latte')
      ) {
        for (const topping of toppingAddOns) {
          productAddOnsData.push({
            productId: product._id,
            addOnId: topping._id,
            isDefault: false,
          });
        }
      }

      // Add extra shot to espresso-based drinks
      if (product.tags.includes('espresso') && extraShotAddOn) {
        productAddOnsData.push({
          productId: product._id,
          addOnId: extraShotAddOn._id,
          isDefault: false,
        });
      }
    }

    const createdProductAddOns = await ProductAddOn.create(productAddOnsData);
    console.log(
      `✅ Linked ${createdProductAddOns.length} product-addon relationships`
    );

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`  - ${createdAddOns.length} add-ons`);
    console.log(`  - ${createdProducts.length} products`);
    console.log(`  - ${createdCustomizations.length} customizations`);
    console.log(`  - ${createdProductAddOns.length} product-addon links`);

    console.log('\n✅ Product seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
