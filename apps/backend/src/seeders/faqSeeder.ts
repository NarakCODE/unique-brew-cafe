import dotenv from 'dotenv';
import { FAQ } from '../models/FAQ.js';
import { connectDB } from '../config/database.js';

// Load environment variables
dotenv.config();

const faqs = [
  // Orders category
  {
    category: 'orders',
    question: 'How do I place an order?',
    answer:
      'To place an order, browse our menu, add items to your cart, proceed to checkout, enter your delivery address, and complete the payment. You will receive a confirmation email once your order is placed.',
    displayOrder: 1,
    isActive: true,
  },
  {
    category: 'orders',
    question: 'Can I modify my order after placing it?',
    answer:
      'You can cancel your order within 5 minutes of placement. After that, please contact our support team for assistance. We cannot guarantee modifications once the order is being prepared.',
    displayOrder: 2,
    isActive: true,
  },
  {
    category: 'orders',
    question: 'How long does delivery take?',
    answer:
      'Delivery times vary based on your location and current order volume. Typically, orders are delivered within 30-45 minutes. You can track your order status in real-time through the app.',
    displayOrder: 3,
    isActive: true,
  },
  {
    category: 'orders',
    question: 'What is the minimum order amount?',
    answer:
      'The minimum order amount varies by location and is displayed during checkout. Generally, it ranges from $10 to $15 depending on your delivery zone.',
    displayOrder: 4,
    isActive: true,
  },
  {
    category: 'orders',
    question: 'Can I schedule an order for later?',
    answer:
      'Yes! During checkout, you can select a pickup time for your order. We recommend scheduling at least 30 minutes in advance to ensure availability.',
    displayOrder: 5,
    isActive: true,
  },

  // Payment category
  {
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept various payment methods including credit/debit cards, mobile wallets (ABA, ACLEDA, Wing), and cash on delivery where available.',
    displayOrder: 1,
    isActive: true,
  },
  {
    category: 'payment',
    question: 'Is my payment information secure?',
    answer:
      'Yes, we use industry-standard encryption and secure payment gateways. We never store your complete card details on our servers.',
    displayOrder: 2,
    isActive: true,
  },
  {
    category: 'payment',
    question: 'How do promo codes work?',
    answer:
      'Enter your promo code at checkout to apply the discount. Each promo code has specific terms including minimum order amounts and usage limits. The discount will be automatically calculated and shown before you complete payment.',
    displayOrder: 3,
    isActive: true,
  },
  {
    category: 'payment',
    question: 'What happens if my payment fails?',
    answer:
      'If your payment fails, your order will remain in pending status for 15 minutes. You can retry the payment or choose a different payment method. After 15 minutes, the order will be automatically cancelled.',
    displayOrder: 4,
    isActive: true,
  },
  {
    category: 'payment',
    question: 'How do refunds work?',
    answer:
      'Refunds are processed within 5-7 business days to your original payment method. For cancelled orders, refunds are initiated automatically. For other issues, please contact our support team.',
    displayOrder: 5,
    isActive: true,
  },

  // Account category
  {
    category: 'account',
    question: 'How do I create an account?',
    answer:
      'Click on "Sign Up" and enter your email address and password. You will receive a verification code via email. Enter the code to verify your account and complete your profile.',
    displayOrder: 1,
    isActive: true,
  },
  {
    category: 'account',
    question: 'I forgot my password. What should I do?',
    answer:
      'Click on "Forgot Password" on the login page. Enter your registered email address, and we will send you a password reset code. Use the code to create a new password.',
    displayOrder: 2,
    isActive: true,
  },
  {
    category: 'account',
    question: 'How do I update my profile information?',
    answer:
      'Go to your profile settings in the app. You can update your name, phone number, email, and profile picture. Some changes may require verification.',
    displayOrder: 3,
    isActive: true,
  },
  {
    category: 'account',
    question: 'Can I save multiple delivery addresses?',
    answer:
      'Yes! You can save multiple delivery addresses in your account. During checkout, simply select the address you want to use or add a new one.',
    displayOrder: 4,
    isActive: true,
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer:
      'To delete your account, go to Settings > Account > Delete Account. Please note that this action is permanent and will remove all your data including order history.',
    displayOrder: 5,
    isActive: true,
  },

  // General category
  {
    category: 'general',
    question: 'What are your operating hours?',
    answer:
      'Our stores have varying operating hours. You can check the specific hours for each store in the app. Most locations are open from 7:00 AM to 9:00 PM daily.',
    displayOrder: 1,
    isActive: true,
  },
  {
    category: 'general',
    question: 'Do you offer loyalty rewards?',
    answer:
      'Yes! Earn loyalty points with every purchase. Points can be redeemed for discounts on future orders. Check your profile to see your current points balance and tier status.',
    displayOrder: 2,
    isActive: true,
  },
  {
    category: 'general',
    question: 'Can I customize my drinks?',
    answer:
      'Absolutely! Most drinks can be customized with options for size, sugar level, ice level, and coffee strength. You can also add extra shots, syrups, and toppings.',
    displayOrder: 3,
    isActive: true,
  },
  {
    category: 'general',
    question: 'Do you have allergen information?',
    answer:
      'Yes, allergen information is available for all products. Check the product details page to see a list of allergens. If you have specific dietary concerns, please contact us.',
    displayOrder: 4,
    isActive: true,
  },
  {
    category: 'general',
    question: 'How do I contact customer support?',
    answer:
      'You can reach our support team through the app by creating a support ticket, or email us directly. We typically respond within 24 hours during business days.',
    displayOrder: 5,
    isActive: true,
  },
];

const seedFAQs = async () => {
  try {
    await connectDB();

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Insert new FAQs
    const createdFAQs = await FAQ.create(faqs);
    console.log(`✅ Successfully seeded ${createdFAQs.length} FAQs`);

    // Display summary by category
    console.log('\n📋 FAQs by Category:');
    const categories = ['orders', 'payment', 'account', 'general'];
    categories.forEach((category) => {
      const categoryFAQs = createdFAQs.filter(
        (faq) => faq.category === category
      );
      console.log(
        `  ${category.toUpperCase()}: ${categoryFAQs.length} questions`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFAQs();
