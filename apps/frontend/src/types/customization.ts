/**
 * Product Customization Types
 * Matches backend ProductCustomization model
 */

export interface CustomizationOption {
    id: string;
    name: string;
    priceModifier: number;
    isDefault: boolean;
}

export type CustomizationType =
    | "size"
    | "sugar_level"
    | "ice_level"
    | "coffee_level";

export interface ProductCustomization {
    id: string;
    productId: string;
    customizationType: CustomizationType;
    options: CustomizationOption[];
    isRequired: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductCustomizationsResponse {
    productId: string;
    customizations: ProductCustomization[];
}

export interface ProductAddOnsResponse {
    productId: string;
    addOns: {
        id: string;
        name: string;
        description: string;
        price: number;
        isAvailable: boolean;
        imageUrl?: string;
    }[];
}
