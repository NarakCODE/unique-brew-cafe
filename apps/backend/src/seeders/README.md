# Database Seeders

This directory contains database seeder scripts for populating the database with test data.

## Available Seeders

### Admin User Seeder

Seeds the database with an initial admin user account for system administration.

**Usage:**

```bash
npm run seed:admin
```

**Configuration:**

Set the following environment variables in your `.env` file:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

**What it creates:**

- Admin user with full system access
- Role: `admin`
- Email verified by default
- Active status

**Note:**

- If an admin user with the specified email already exists, the seeder will skip creation
- If a user exists with the email but has a different role, it will be updated to admin
- **IMPORTANT:** Change the default password after first login for security

### Category Seeder

Seeds the database with initial product categories.

**Usage:**

```bash
npm run seed:categories
```

**Categories included:**

- Hot Coffee
- Iced Coffee
- Espresso
- Specialty Drinks
- Tea
- Smoothies
- Pastries
- Sandwiches

**Note:** This seeder will clear all existing categories before inserting new ones.

### Product Seeder

Seeds the database with products, customizations, add-ons, and their relationships.

**Usage:**

```bash
npm run seed:products
```

**Prerequisites:** Categories must be seeded first (`npm run seed:categories`)

**What it seeds:**

- **Add-ons**: Syrups (Vanilla, Caramel, Hazelnut, Mocha), Toppings (Whipped Cream, Chocolate/Caramel Drizzle), Extra Espresso Shot
- **Products**: 12 coffee products across Hot Coffee, Iced Coffee, Espresso, and Specialty Drinks categories
- **Customizations**: Size, Sugar Level, Ice Level (iced drinks), Coffee Level (espresso drinks)
- **Product-AddOn Links**: Appropriate add-ons linked to each product

**Note:** This seeder will clear all existing products, customizations, add-ons, and their relationships before inserting new ones.

### Promo Code Seeder

Seeds the database with sample promotional codes for testing discount functionality.

**Usage:**

```bash
npm run seed:promos
```

**What it creates:**

- **Active Promo Codes**: WELCOME10, SAVE20, FREESHIP, COFFEE5, WEEKEND15, LOYALTY25, FIRSTORDER
- **Inactive Promo Code**: EXPIRED50 (for testing expired codes)
- Various discount types (percentage and fixed amount)
- Different usage limits and minimum order amounts

**Note:** This seeder will clear all existing promo codes before inserting new ones.

### FAQ Seeder

Seeds the database with frequently asked questions across different categories.

**Usage:**

```bash
npm run seed:faqs
```

**Categories included:**

- **Orders**: Questions about placing, modifying, and tracking orders
- **Payment**: Payment methods, security, promo codes, and refunds
- **Account**: Account creation, password reset, profile management
- **General**: Operating hours, loyalty rewards, customization, allergens, support

**What it creates:**

- 25 FAQs covering common customer questions
- Organized by category with display order
- All FAQs active by default

**Note:** This seeder will clear all existing FAQs before inserting new ones.

### App Configuration Seeder

Seeds the database with system configuration values.

**Usage:**

```bash
npm run seed:config
```

**Configuration categories:**

- **App Settings**: Version, maintenance mode, minimum order amount, tax rate, currency
- **Payment Settings**: Available payment methods, enabled payment types
- **Delivery Settings**: Base fee, per-km fee, free delivery threshold, max distance
- **Order Settings**: Cancellation window, preparation buffer, auto-completion time
- **Cart Settings**: Expiration time for abandoned carts
- **Checkout Settings**: Session expiration time
- **OTP Settings**: Expiration time, max attempts
- **Support Settings**: Contact email, phone, operating hours
- **Feature Flags**: Loyalty, referral, notifications

**What it creates:**

- 27 configuration entries
- Mix of public and private configurations
- Default values for all system settings

**Note:** This seeder will clear all existing configurations before inserting new ones.

### Delivery Zone Seeder

Seeds the database with sample delivery zones with geographic boundaries.

**Usage:**

```bash
npm run seed:zones
```

**Zones included:**

- **Downtown Core**: $2.50 fee, 20-30 min delivery
- **North/South Districts**: $3.50 fee, 30-40 min delivery
- **East/West Districts**: $4.00 fee, 35-45 min delivery
- **Suburban Area**: $5.00 fee, 45-60 min delivery
- **Airport Zone**: $6.00 fee, 50-70 min delivery
- **University Campus**: $2.00 fee, 15-25 min delivery (lower minimum)
- **Business Park**: $3.00 fee, 25-35 min delivery
- **Inactive Test Zone**: For testing inactive zones

**What it creates:**

- 10 delivery zones with geographic polygons
- Different delivery fees and minimum order amounts
- Estimated delivery times for each zone
- 9 active zones and 1 inactive zone for testing

**Note:** This seeder will clear all existing delivery zones before inserting new ones. The coordinates are example values and should be updated for your actual service area.

### Seed All Data

Run all seeders in the correct order with a single command.

**Usage:**

```bash
npm run seed:all
```

**Execution order:**

1. Admin user
2. Categories
3. Products (with customizations and add-ons)
4. Promo codes
5. FAQs
6. App configuration
7. Delivery zones

**Note:** This will clear and reseed all data in the database. Use with caution in production environments.

## Creating New Seeders

1. Create a new file in `src/seeders/` (e.g., `productSeeder.ts`)
2. Import required models and database connection
3. Load environment variables with `dotenv.config()`
4. Create your seed data array
5. Implement the seeder function
6. Add a script to `package.json`

**Example:**

```typescript
import dotenv from 'dotenv';
import { YourModel } from '../models/YourModel.js';
import { connectDB } from '../config/database.js';

dotenv.config();

const data = [
  // your seed data
];

const seedData = async () => {
  try {
    await connectDB();
    await YourModel.deleteMany({});
    const created = await YourModel.create(data);
    console.log(`✅ Successfully seeded ${created.length} items`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
};

seedData();
```
