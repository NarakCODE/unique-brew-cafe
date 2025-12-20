export interface NutritionalInfo {
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    caffeine?: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string | { _id: string; name: string }; // Depending on population
    category?: {
        _id: string;
        name: string;
        slug: string;
        imageUrl?: string;
        icon?: string;
    };
    images: string[];
    basePrice: number;
    currency: "USD" | "KHR";
    preparationTime: number;
    calories?: number;
    rating?: number;
    totalReviews: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isBestSelling: boolean;
    allergens: string[];
    tags: string[];
    nutritionalInfo?: NutritionalInfo;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    images?: string[]; // Simplified for now, handle array of strings or FormData
    basePrice: number;
    currency?: "USD" | "KHR";
    preparationTime?: number;
    calories?: number;
    isAvailable?: boolean;
    isFeatured?: boolean;
    isBestSelling?: boolean;
    allergens?: string[];
    tags?: string[];
    nutritionalInfo?: NutritionalInfo;
    displayOrder?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id?: string;
}

export interface ProductFilters {
    categoryId?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
    isBestSelling?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    tags?: string[];
}
