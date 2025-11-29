export interface AppConfig {
    id: string;
    appName: string;
    maintenanceMode: boolean;
    supportEmail: string;
    supportPhone: string;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    minOrderAmount: number;
    deliveryFee: number;
    freeDeliveryThreshold: number;
}

export interface DeliveryZone {
    id: string;
    name: string;
    coordinates: [number, number][];
    isActive: boolean;
    deliveryFee?: number;
}

export interface CreateDeliveryZoneData {
    name: string;
    coordinates: [number, number][];
    isActive?: boolean;
    deliveryFee?: number;
}

export type UpdateDeliveryZoneData = Partial<CreateDeliveryZoneData>;
