export interface Addon {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAddonData {
    name: string;
    price: number;
    isAvailable?: boolean;
    category?: string;
}

export type UpdateAddonData = Partial<CreateAddonData>;
