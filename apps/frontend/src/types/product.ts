// Product Types
export interface ProductCustomization {
    id: string;
    name: string;
    options: ProductCustomizationOption[];
    required: boolean;
    maxSelections?: number;
}

export interface ProductCustomizationOption {
    id: string;
    name: string;
    priceModifier: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    images: string[];
    basePrice: number;
    currency: string;
    preparationTime: number;
    calories?: number;
    rating?: number;
    totalReviews: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isBestSelling: boolean;
    allergens?: string[];
    tags?: string[];
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductData {
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
    preparationTime: number;
    images?: string[];
    calories?: number;
    allergens?: string[];
    tags?: string[];
    isAvailable?: boolean;
}

export type UpdateProductData = Partial<CreateProductData>;
