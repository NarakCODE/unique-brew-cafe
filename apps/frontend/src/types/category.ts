// Category Types
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    storeId: string;
    imageUrl?: string;
    icon?: string;
    parentId?: string;
    displayOrder: number;
    isActive: boolean;
    productCount?: number; // Optional as it might be aggregated
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryData {
    name: string;
    description?: string;
    storeId: string;
    imageUrl?: string;
    icon?: string;
    parentId?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
    id?: string;
}
