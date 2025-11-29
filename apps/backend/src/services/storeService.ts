import { Store, type IStore } from '../models/Store.js';
import { NotFoundError } from '../utils/AppError.js';
import {
  parsePaginationParams,
  buildPaginationResult,
  type PaginationParams,
  type PaginationResult,
} from '../utils/pagination.js';

interface StoreFilters {
  latitude?: number | undefined;
  longitude?: number | undefined;
  radius?: number | undefined; // in kilometers
  city?: string | undefined;
  isActive?: boolean | undefined;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createStore = async (storeData: any): Promise<IStore> => {
  const store = new Store(storeData);
  await store.save();
  return store;
};

/**
 * Get all stores including inactive ones (Admin only) with pagination
 * @param paginationParams - Pagination parameters
 * @param filters - Optional filters
 * @returns Paginated stores
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAllStoresAdmin = async (
  paginationParams?: PaginationParams,
  filters?: StoreFilters
): Promise<PaginationResult<any>> => {
  const query: Record<string, unknown> = {};

  // Apply filters
  if (filters?.city) {
    query.city = { $regex: filters.city, $options: 'i' };
  }

  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  // Parse pagination parameters
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(
    paginationParams || {}
  );

  // Build sort object
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  // Execute query with pagination
  const [stores, total] = await Promise.all([
    Store.find(query)
      .select('-__v') // Exclude version key
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Store.countDocuments(query),
  ]);

  const result = [];
  for (const store of stores) {
    const storeDoc = await Store.findById(store._id);
    result.push({
      ...store,
      id: store._id?.toString(),
      isOpenNow: storeDoc ? storeDoc.isOpenNow() : false,
    });
  }

  return buildPaginationResult(result, total, page, limit);
};

/**
 * Get all active stores with optional location-based filtering and pagination
 * @param filters - Optional filters for location-based search
 * @param paginationParams - Pagination parameters
 * @returns Paginated stores with distance if location provided
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAllStores = async (
  filters?: StoreFilters,
  paginationParams?: PaginationParams
): Promise<PaginationResult<any>> => {
  const query: Record<string, unknown> = { isActive: true };

  // Apply city filter
  if (filters?.city) {
    query.city = { $regex: filters.city, $options: 'i' };
  }

  // Parse pagination parameters
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(
    paginationParams || {}
  );

  // If location filters provided, use geospatial query
  if (
    filters?.latitude !== undefined &&
    filters?.longitude !== undefined &&
    filters?.radius !== undefined
  ) {
    // Use MongoDB geospatial query for better performance
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [filters.longitude, filters.latitude],
        },
        $maxDistance: filters.radius * 1000, // Convert km to meters
      },
    };

    // For geospatial queries, we can't use skip/limit effectively
    // So we'll fetch and then paginate in memory
    const stores = await Store.find(query)
      .select('-__v')
      .limit(limit * page) // Fetch enough for current page
      .lean();

    const total = await Store.countDocuments(query);

    const storesWithDistance = [];
    for (const store of stores) {
      const distance = calculateDistance(
        filters.latitude,
        filters.longitude,
        store.latitude,
        store.longitude
      );

      const storeDoc = await Store.findById(store._id);
      storesWithDistance.push({
        ...store,
        id: store._id?.toString(),
        distance,
        isOpenNow: storeDoc ? storeDoc.isOpenNow() : false,
      });
    }

    // Apply pagination
    const paginatedStores = storesWithDistance.slice(skip, skip + limit);

    return buildPaginationResult(paginatedStores, total, page, limit);
  }

  // Standard query with pagination
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  const [stores, total] = await Promise.all([
    Store.find(query).select('-__v').sort(sort).skip(skip).limit(limit).lean(),
    Store.countDocuments(query),
  ]);

  // Add isOpenNow status
  const result = [];
  for (const store of stores) {
    const storeDoc = await Store.findById(store._id);
    result.push({
      ...store,
      id: store._id?.toString(),
      isOpenNow: storeDoc ? storeDoc.isOpenNow() : false,
    });
  }

  return buildPaginationResult(result, total, page, limit);
};

/**
 * Get store by ID
 * @param storeId - Store ID
 * @returns Store details
 * @throws NotFoundError if store not found or inactive
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStoreById = async (storeId: string): Promise<any> => {
  const store = await Store.findOne({ _id: storeId, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  const storeData = store.toObject();
  return {
    ...storeData,
    id: storeData._id?.toString(),
    isOpenNow: store.isOpenNow(),
  };
};

/**
 * Get store by slug
 * @param slug - Store slug
 * @returns Store details
 * @throws NotFoundError if store not found or inactive
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getStoreBySlug = async (slug: string): Promise<any> => {
  const store = await Store.findOne({ slug, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  const storeData = store.toObject();
  return {
    ...storeData,
    id: storeData._id?.toString(),
    isOpenNow: store.isOpenNow(),
  };
};

/**
 * Get available pickup times for a store
 * @param storeId - Store ID
 * @param date - Optional date (defaults to today)
 * @returns Array of available pickup time slots
 * @throws NotFoundError if store not found or inactive
 */
export const getAvailablePickupTimes = async (storeId: string, date?: Date) => {
  const store = await Store.findOne({ _id: storeId, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  const pickupTimes = store.getPickupTimes(date);

  return {
    storeId: String(store._id),
    storeName: store.name,
    date: date || new Date(),
    pickupTimes,
  };
};

/**
 * Get store gallery images
 * @param storeId - Store ID
 * @returns Gallery images array
 * @throws NotFoundError if store not found or inactive
 */
export const getStoreGallery = async (storeId: string) => {
  const store = await Store.findOne({ _id: storeId, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  return {
    storeId: String(store._id),
    storeName: store.name,
    images: store.images || [],
  };
};

/**
 * Get store opening hours
 * @param storeId - Store ID
 * @returns Opening hours and special hours
 * @throws NotFoundError if store not found or inactive
 */
export const getStoreHours = async (storeId: string) => {
  const store = await Store.findOne({ _id: storeId, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  return {
    storeId: String(store._id),
    storeName: store.name,
    openingHours: store.openingHours,
    specialHours: store.specialHours || [],
    isOpenNow: store.isOpenNow(),
  };
};

/**
 * Get store location details
 * @param storeId - Store ID
 * @returns Location information including address and coordinates
 * @throws NotFoundError if store not found or inactive
 */
export const getStoreLocation = async (storeId: string) => {
  const store = await Store.findOne({ _id: storeId, isActive: true });

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  return {
    storeId: String(store._id),
    storeName: store.name,
    address: store.address,
    city: store.city,
    state: store.state,
    postalCode: store.postalCode,
    country: store.country,
    latitude: store.latitude,
    longitude: store.longitude,
  };
};

/**
 * Update store details (Admin only)
 * @param storeId - Store ID
 * @param updateData - Store data to update
 * @returns Updated store
 * @throws NotFoundError if store not found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateStore = async (storeId: string, updateData: any) => {
  const store = await Store.findById(storeId);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // Update store fields
  Object.assign(store, updateData);
  await store.save();

  const storeData = store.toObject();
  return {
    ...storeData,
    id: storeData._id?.toString(),
    isOpenNow: store.isOpenNow(),
  };
};

/**
 * Delete store and cascade delete related data (Admin only)
 * @param storeId - Store ID
 * @throws NotFoundError if store not found
 */
export const deleteStore = async (storeId: string): Promise<void> => {
  const store = await Store.findById(storeId);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // TODO: Cascade delete related categories and products
  // This should be implemented when Category and Product models are available
  // await Category.deleteMany({ storeId });
  // await Product.deleteMany({ storeId });

  await Store.findByIdAndDelete(storeId);
};

/**
 * Toggle store active status (Admin only)
 * @param storeId - Store ID
 * @returns Updated store
 * @throws NotFoundError if store not found
 */
export const toggleStoreStatus = async (storeId: string) => {
  const store = await Store.findById(storeId);

  if (!store) {
    throw new NotFoundError('Store not found');
  }

  store.isActive = !store.isActive;
  await store.save();

  const storeData = store.toObject();
  return {
    ...storeData,
    id: storeData._id?.toString(),
    isOpenNow: store.isOpenNow(),
  };
};
