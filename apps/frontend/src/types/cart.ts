export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    addons?: string[];
    price: number;
    productName?: string;
    productImage?: string;
    _optimistic?: boolean;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalQuantity: number;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}
