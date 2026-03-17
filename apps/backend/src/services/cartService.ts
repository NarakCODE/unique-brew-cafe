import { Cart } from '../models/Cart.js';
import { CartItem } from '../models/CartItem.js';
import { Product } from '../models/Product.js';
import { Store } from '../models/Store.js';
import { AddOn } from '../models/AddOn.js';
import { ProductAddOn } from '../models/ProductAddOn.js';
import { ProductCustomization } from '../models/ProductCustomization.js';
import { cleanImageUrls } from './productService.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';
import mongoose from 'mongoose';

// Tax rate (10%)
const TAX_RATE = 0.1;

// Base delivery fee
const BASE_DELIVERY_FEE = 2.0;

interface AddCartItemDTO {
  productId: string;
  quantity: number;
  customization?: {
    size?: string;
    sugarLevel?: string;
    iceLevel?: string;
    coffeeLevel?: string;
  };
  addOns?: string[];
  notes?: string;
}

type ResolvedAddOn = {
  id: string;
  name: string;
  price: number;
};

type PricingResult = {
  unitPrice: number;
  customization?: AddCartItemDTO['customization'];
  addOns: ResolvedAddOn[];
};

interface CartValidationResult {
  isValid: boolean;
  issues: Array<{
    itemId: string;
    productId: string;
    issue: string;
  }>;
}

interface CartSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

/**
 * Get or create active cart for user
 * @param userId - User ID
 * @returns Cart with populated items
 */
export const getCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId, status: 'active' }).populate({
    path: 'storeId',
    select: 'name slug address city',
  });

  // If no active cart exists, return empty cart structure
  if (!cart) {
    return {
      cart: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  // Get cart items with product details
  const items = await CartItem.find({ cartId: cart._id }).populate({
    path: 'productId',
    select:
      'name slug images basePrice currency isAvailable preparationTime categoryId',
  });

  const formattedItems = items.map((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemData = item.toJSON() as any;
    if (itemData.productId && Array.isArray(itemData.productId.images)) {
      itemData.productId.images = cleanImageUrls(itemData.productId.images);
    }
    return itemData;
  });

  return {
    cart,
    items: formattedItems,
    itemCount: formattedItems.length,
  };
};

/**
 * Add item to cart
 * @param userId - User ID
 * @param itemData - Item data
 * @returns Updated cart with items
 */
export const addItem = async (userId: string, itemData: AddCartItemDTO) => {
  // Validate product exists and is available
  const product = await Product.findById(itemData.productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (!product.isAvailable) {
    throw new BadRequestError('Product is not available');
  }

  // Get the store ID from the product's category
  const category = await mongoose
    .model('Category')
    .findById(product.categoryId);
  if (!category) {
    throw new NotFoundError('Product category not found');
  }

  const storeId = (category as { storeId: mongoose.Types.ObjectId }).storeId;

  // Verify store exists and is active
  const store = await Store.findById(storeId);
  if (!store) {
    throw new NotFoundError('Store not found');
  }

  if (!store.isActive) {
    throw new BadRequestError('Store is not active');
  }

  // Get or create active cart
  const existingCart = await Cart.findOne({ userId, status: 'active' });

  let cart;
  if (existingCart) {
    // Validate that item is from the same store
    if (existingCart.storeId.toString() !== storeId.toString()) {
      throw new BadRequestError(
        'Cannot add items from different stores. Please clear your cart first.'
      );
    }
    cart = existingCart;
  } else {
    // Create new cart
    cart = await Cart.create({
      userId,
      storeId,
      status: 'active',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }

  const pricing = await resolveCartItemPricing(
    itemData.productId,
    product.basePrice,
    itemData.customization,
    itemData.addOns
  );

  const totalPrice = pricing.unitPrice * itemData.quantity;

  // Create cart item
  await CartItem.create({
    cartId: cart._id,
    productId: itemData.productId,
    quantity: itemData.quantity,
    customization: pricing.customization,
    addOns: pricing.addOns.map((entry) => entry.id),
    notes: itemData.notes,
    unitPrice: pricing.unitPrice,
    totalPrice,
  });

  // Recalculate cart totals
  await calculateTotals((cart._id as mongoose.Types.ObjectId).toString());

  // Return updated cart
  return getCart(userId);
};

/**
 * Update cart item quantity
 * @param userId - User ID
 * @param itemId - Cart item ID
 * @param quantity - New quantity
 * @returns Updated cart with items
 */
export const updateItemQuantity = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  if (quantity < 1) {
    throw new BadRequestError('Quantity must be at least 1');
  }

  // Find cart item
  const cartItem = await CartItem.findById(itemId);
  if (!cartItem) {
    throw new NotFoundError('Cart item not found');
  }

  // Verify cart belongs to user
  const cart = await Cart.findOne({
    _id: cartItem.cartId,
    userId,
    status: 'active',
  });

  if (!cart) {
    throw new NotFoundError('Cart not found or does not belong to user');
  }

  // Verify product is still available
  const product = await Product.findById(cartItem.productId);
  if (!product || !product.isAvailable) {
    throw new BadRequestError('Product is no longer available');
  }

  // Update quantity and total price
  cartItem.quantity = quantity;
  cartItem.totalPrice = cartItem.unitPrice * quantity;
  await cartItem.save();

  // Recalculate cart totals
  await calculateTotals((cart._id as mongoose.Types.ObjectId).toString());

  // Return updated cart
  return getCart(userId);
};

/**
 * Remove item from cart
 * @param userId - User ID
 * @param itemId - Cart item ID
 * @returns Updated cart with items
 */
export const removeItem = async (userId: string, itemId: string) => {
  // Find cart item
  const cartItem = await CartItem.findById(itemId);
  if (!cartItem) {
    throw new NotFoundError('Cart item not found');
  }

  // Verify cart belongs to user
  const cart = await Cart.findOne({
    _id: cartItem.cartId,
    userId,
    status: 'active',
  });

  if (!cart) {
    throw new NotFoundError('Cart not found or does not belong to user');
  }

  // Delete cart item
  await CartItem.findByIdAndDelete(itemId);

  // Check if cart is now empty
  const remainingItems = await CartItem.countDocuments({ cartId: cart._id });

  if (remainingItems === 0) {
    // Delete empty cart
    await Cart.findByIdAndDelete(cart._id);
    return {
      cart: null,
      items: [],
      itemCount: 0,
    };
  }

  // Recalculate cart totals
  await calculateTotals((cart._id as mongoose.Types.ObjectId).toString());

  // Return updated cart
  return getCart(userId);
};

/**
 * Clear all items from cart
 * @param userId - User ID
 * @returns Success message
 */
export const clearCart = async (userId: string) => {
  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    throw new NotFoundError('No active cart found');
  }

  // Delete all cart items
  await CartItem.deleteMany({ cartId: cart._id });

  // Delete cart
  await Cart.findByIdAndDelete(cart._id);

  return {
    message: 'Cart cleared successfully',
  };
};

/**
 * Validate cart items
 * @param userId - User ID
 * @returns Validation result
 */
export const validateCart = async (
  userId: string
): Promise<CartValidationResult> => {
  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    return {
      isValid: true,
      issues: [],
    };
  }

  const items = await CartItem.find({ cartId: cart._id }).populate('productId');

  const issues: Array<{
    itemId: string;
    productId: string;
    issue: string;
  }> = [];

  for (const item of items) {
    const product = item.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      isAvailable: boolean;
      basePrice: number;
    };

    if (!product) {
      issues.push({
        itemId: (item._id as mongoose.Types.ObjectId).toString(),
        productId: item.productId.toString(),
        issue: 'Product no longer exists',
      });
      continue;
    }

    if (!product.isAvailable) {
      issues.push({
        itemId: (item._id as mongoose.Types.ObjectId).toString(),
        productId: product._id.toString(),
        issue: 'Product is no longer available',
      });
    }

    try {
      const pricing = await resolveCartItemPricing(
        product._id.toString(),
        product.basePrice,
        item.customization,
        item.addOns?.map((entry) => entry.toString())
      );

      if (item.unitPrice !== pricing.unitPrice) {
        issues.push({
          itemId: (item._id as mongoose.Types.ObjectId).toString(),
          productId: product._id.toString(),
          issue: `Price has changed from ${item.unitPrice} to ${pricing.unitPrice}`,
        });
      }
    } catch (error) {
      issues.push({
        itemId: (item._id as mongoose.Types.ObjectId).toString(),
        productId: product._id.toString(),
        issue:
          error instanceof Error ? error.message : 'Unable to validate item pricing',
      });
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * Set delivery address for cart
 * @param userId - User ID
 * @param addressId - Address ID
 * @returns Updated cart
 */
export const setDeliveryAddress = async (userId: string, addressId: string) => {
  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    throw new NotFoundError('No active cart found');
  }

  // In a real implementation, you would verify the address exists and belongs to the user
  // For now, we'll just store the address ID
  cart.deliveryAddress = addressId;
  await cart.save();

  // Recalculate totals (delivery fee might change based on address)
  await calculateTotals((cart._id as mongoose.Types.ObjectId).toString());

  return getCart(userId);
};

/**
 * Set notes for cart
 * @param userId - User ID
 * @param notes - Order notes
 * @returns Updated cart
 */
export const setNotes = async (userId: string, notes: string) => {
  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    throw new NotFoundError('No active cart found');
  }

  cart.notes = notes;
  await cart.save();

  return getCart(userId);
};

/**
 * Get cart summary
 * @param userId - User ID
 * @returns Cart summary with itemized totals
 */
export const getCartSummary = async (userId: string): Promise<CartSummary> => {
  const cart = await Cart.findOne({ userId, status: 'active' });

  if (!cart) {
    return {
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
    };
  }

  const itemCount = await CartItem.countDocuments({ cartId: cart._id });

  return {
    itemCount,
    subtotal: cart.subtotal,
    discount: cart.discount,
    tax: cart.tax,
    deliveryFee: cart.deliveryFee,
    total: cart.total,
  };
};

/**
 * Calculate and update cart totals
 * @param cartId - Cart ID
 */
const calculateTotals = async (cartId: string): Promise<void> => {
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new NotFoundError('Cart not found');
  }

  // Get all cart items
  const items = await CartItem.find({ cartId });

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate tax (10% of subtotal after discount)
  const discountedSubtotal = subtotal - cart.discount;
  const tax = discountedSubtotal * TAX_RATE;

  // Delivery fee (could be calculated based on address/distance)
  const deliveryFee = subtotal > 0 && cart.deliveryAddress ? BASE_DELIVERY_FEE : 0;

  // Calculate total
  const total = discountedSubtotal + tax + deliveryFee;

  // Update cart
  cart.subtotal = subtotal;
  cart.tax = tax;
  cart.deliveryFee = deliveryFee;
  cart.total = total;

  await cart.save();
};

const CUSTOMIZATION_FIELD_MAP = {
  size: 'size',
  sugar_level: 'sugarLevel',
  ice_level: 'iceLevel',
  coffee_level: 'coffeeLevel',
} as const;

async function resolveCartItemPricing(
  productId: string,
  basePrice: number,
  customization?: AddCartItemDTO['customization'],
  addOnIds?: string[]
): Promise<PricingResult> {
  let unitPrice = basePrice;
  const normalizedCustomization = { ...(customization ?? {}) };

  const productCustomizations = await ProductCustomization.find({ productId });

  for (const productCustomization of productCustomizations) {
    const field =
      CUSTOMIZATION_FIELD_MAP[
        productCustomization.customizationType as keyof typeof CUSTOMIZATION_FIELD_MAP
      ];

    if (!field) {
      continue;
    }

    let selectedOptionId = normalizedCustomization[field];

    if (!selectedOptionId) {
      const defaultOption = productCustomization.options.find(
        (option) => option.isDefault
      );

      if (productCustomization.isRequired && !defaultOption) {
        throw new BadRequestError(
          `${formatCustomizationLabel(field)} is required for this product`
        );
      }

      if (defaultOption) {
        selectedOptionId = defaultOption.id;
        normalizedCustomization[field] = defaultOption.id;
      }
    }

    if (!selectedOptionId) {
      continue;
    }

    const matchedOption = resolveCustomizationOption(
      productCustomization.options,
      field,
      selectedOptionId
    );

    if (!matchedOption) {
      throw new BadRequestError(
        `Invalid ${formatCustomizationLabel(field)} selection`
      );
    }

    normalizedCustomization[field] = matchedOption.id;
    unitPrice += matchedOption.priceModifier;
  }

  const selectedAddOnIds = Array.from(new Set(addOnIds ?? []));
  if (selectedAddOnIds.length === 0) {
    return {
      unitPrice,
      customization:
        Object.keys(normalizedCustomization).length > 0
          ? normalizedCustomization
          : undefined,
      addOns: [],
    };
  }

  const productAddOns = await ProductAddOn.find({
    productId,
    addOnId: { $in: selectedAddOnIds },
  });
  const availableAddOnIds = new Set(
    productAddOns.map((entry) => entry.addOnId.toString())
  );

  if (availableAddOnIds.size !== selectedAddOnIds.length) {
    throw new BadRequestError('One or more selected add-ons are invalid');
  }

  const addOnDocs = await AddOn.find({
    _id: { $in: selectedAddOnIds },
    isAvailable: true,
  });

  if (addOnDocs.length !== selectedAddOnIds.length) {
    throw new BadRequestError('One or more selected add-ons are unavailable');
  }

  const resolvedAddOns = selectedAddOnIds.flatMap((addOnId) => {
    const addOn = addOnDocs.find((entry) => entry._id.toString() === addOnId);
    if (!addOn) {
      return [];
    }

    unitPrice += addOn.price;

    return [
      {
        id: addOn._id.toString(),
        name: addOn.name,
        price: addOn.price,
      },
    ];
  });

  return {
    unitPrice,
    customization:
      Object.keys(normalizedCustomization).length > 0
        ? normalizedCustomization
        : undefined,
    addOns: resolvedAddOns,
  };
}

function formatCustomizationLabel(
  field: keyof NonNullable<AddCartItemDTO['customization']>
) {
  switch (field) {
    case 'sugarLevel':
      return 'Sugar level';
    case 'iceLevel':
      return 'Ice level';
    case 'coffeeLevel':
      return 'Coffee level';
    default:
      return 'Size';
  }
}

function resolveCustomizationOption(
  options: Array<{
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
  }>,
  field: keyof NonNullable<AddCartItemDTO['customization']>,
  selectedValue: string
) {
  const normalizedSelectedValue = normalizeCustomizationValue(selectedValue);

  return (
    options.find(
      (option) => normalizeCustomizationValue(option.id) === normalizedSelectedValue
    ) ??
    options.find(
      (option) =>
        normalizeCustomizationValue(option.name) === normalizedSelectedValue
    ) ??
    options.find((option) =>
      getCustomizationAliases(field, option).includes(normalizedSelectedValue)
    )
  );
}

function getCustomizationAliases(
  field: keyof NonNullable<AddCartItemDTO['customization']>,
  option: {
    id: string;
    name: string;
  }
) {
  const normalizedId = normalizeCustomizationValue(option.id);
  const normalizedName = normalizeCustomizationValue(option.name);

  switch (field) {
    case 'size':
      if (normalizedId === 'small' || normalizedName.includes('small')) {
        return ['s', 'small'];
      }

      if (
        normalizedId === 'medium' ||
        normalizedName.includes('medium') ||
        normalizedName.includes('regular')
      ) {
        return ['m', 'medium', 'regular'];
      }

      if (normalizedId === 'large' || normalizedName.includes('large')) {
        return ['l', 'large'];
      }

      break;
    case 'sugarLevel':
      if (
        normalizedId === 'nosugar' ||
        normalizedName.includes('nosugar') ||
        normalizedName.includes('no sugar')
      ) {
        return ['none', 'nosugar', 'no_sugar'];
      }

      if (
        normalizedId === 'lesssugar' ||
        normalizedName.includes('lesssugar') ||
        normalizedName.includes('less sugar')
      ) {
        return ['low', 'lesssugar', 'less_sugar'];
      }

      if (normalizedId === 'regular' || normalizedName.includes('regular')) {
        return ['medium', 'regular'];
      }

      if (
        normalizedId === 'extrasugar' ||
        normalizedName.includes('extrasugar') ||
        normalizedName.includes('extra sugar')
      ) {
        return ['high', 'extrasugar', 'extra_sugar'];
      }

      break;
    case 'iceLevel':
      if (
        normalizedId === 'noice' ||
        normalizedName.includes('noice') ||
        normalizedName.includes('no ice')
      ) {
        return ['none', 'noice', 'no_ice'];
      }

      if (
        normalizedId === 'lessice' ||
        normalizedName.includes('lessice') ||
        normalizedName.includes('less ice')
      ) {
        return ['low', 'lessice', 'less_ice'];
      }

      if (normalizedId === 'regular' || normalizedName.includes('regular')) {
        return ['medium', 'regular'];
      }

      if (
        normalizedId === 'extraice' ||
        normalizedName.includes('extraice') ||
        normalizedName.includes('extra ice')
      ) {
        return ['high', 'extraice', 'extra_ice'];
      }

      break;
    case 'coffeeLevel':
      if (normalizedId === 'decaf' || normalizedName.includes('decaf')) {
        return ['single', 'decaf'];
      }

      if (normalizedId === 'regular' || normalizedName.includes('regular')) {
        return ['double', 'regular'];
      }

      if (
        normalizedId === 'extrashot' ||
        normalizedName.includes('extra shot')
      ) {
        return ['triple', 'extrashot', 'extra_shot'];
      }

      break;
  }

  return [];
}

function normalizeCustomizationValue(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}
