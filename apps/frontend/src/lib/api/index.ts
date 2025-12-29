import { apiClient, fetchClient, ApiClientError } from "./client";
import { apiConfig } from "./config";
import type { PaginatedResponse } from "@/types/api";
import type {
    LoginCredentials,
    AuthResponse,
    AuthTokens,
    InitiateRegistrationInput,
    VerifyRegistrationInput,
} from "@/types/auth";
import type {
    User,
    UpdateUserData,
    CreateUserData,
    UpdateUserStatusData,
    Product,
    CreateProductData,
    UpdateProductData,
    ProductCustomizationsResponse,
    ProductAddOnsResponse,
    Order,
    CreateOrderData,
    Cart,
    FavoriteItem,
    Notification,
    Addon,
    CreateAddonData,
    UpdateAddonData,
    DashboardStats,
    SalesReport,
    OrdersReport,
    ProductsReport,
    RevenueReport,
    AppConfig,
    DeliveryZone,
    CreateDeliveryZoneData,
    UpdateDeliveryZoneData,
    SupportTicket,
    UserProfile,
    UpdateProfileData,
    UpdateSettingsData,
    UpdatePasswordData,
    ReferralStats,
    DeleteAccountData,
    Store,
    CreateStoreData,
    UpdateStoreData,
    Category,
    CreateCategoryData,
    UpdateCategoryData,
} from "@/types";

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

/**
 * Build URL with query params
 */
export function buildUrl(
    path: string,
    params?: Record<string, unknown>
): string {
    if (!params) return path;
    return `${path}${buildQueryString(params)}`;
}

// ============================================================================
// API SERVICE
// ============================================================================

/**
 * High-level API service with convenience methods
 */
export const api = {
    // ========================================
    // AUTH
    // ========================================
    auth: {
        /**
         * Login user
         */
        async login(credentials: LoginCredentials): Promise<AuthResponse> {
            return apiClient.post<AuthResponse>(
                apiConfig.endpoints.auth.login,
                credentials
            );
        },

        /**
         * Initiate registration
         */
        async initiateRegistration(
            data: InitiateRegistrationInput
        ): Promise<{ message: string; email: string }> {
            return apiClient.post<{ message: string; email: string }>(
                apiConfig.endpoints.auth.initiateRegistration,
                data
            );
        },

        /**
         * Verify registration
         */
        async verifyRegistration(
            data: VerifyRegistrationInput
        ): Promise<AuthResponse> {
            return apiClient.post<AuthResponse>(
                apiConfig.endpoints.auth.verifyRegistration,
                data
            );
        },

        /**
         * Register new user (Legacy)
         */
        async register(data: {
            email: string;
            password: string;
            name: string;
            phone?: string;
        }): Promise<AuthResponse> {
            return apiClient.post<AuthResponse>(
                apiConfig.endpoints.auth.register,
                data
            );
        },

        /**
         * Logout user
         */
        async logout(): Promise<void> {
            return apiClient.post<void>(apiConfig.endpoints.auth.logout);
        },

        /**
         * Refresh access token
         */
        async refresh(refreshToken: string): Promise<AuthTokens> {
            return apiClient.post<AuthTokens>(
                apiConfig.endpoints.auth.refresh,
                { refreshToken }
            );
        },

        /**
         * Verify email with OTP
         */
        async verifyEmail(data: { email: string; otp: string }): Promise<void> {
            return apiClient.post<void>(
                apiConfig.endpoints.auth.verifyEmail,
                data
            );
        },

        /**
         * Resend verification email
         */
        async resendVerification(
            email: string,
            type: "registration" | "password_reset" = "registration"
        ): Promise<void> {
            return apiClient.post<void>(
                apiConfig.endpoints.auth.resendVerification,
                { email, verificationType: type }
            );
        },

        /**
         * Request password reset
         */
        async forgotPassword(email: string): Promise<void> {
            return apiClient.post<void>(
                apiConfig.endpoints.auth.forgotPassword,
                { email }
            );
        },

        /**
         * Reset password with token
         */
        async resetPassword(data: {
            token: string;
            password: string;
        }): Promise<void> {
            return apiClient.post<void>(
                apiConfig.endpoints.auth.resetPassword,
                data
            );
        },

        /**
         * Get current user
         */
        async me(): Promise<AuthResponse["user"]> {
            return apiClient.get<AuthResponse["user"]>(
                apiConfig.endpoints.auth.me
            );
        },
    },

    // ========================================
    // USERS
    // ========================================
    users: {
        /**
         * Get list of users (admin only)
         */
        async list(params?: {
            page?: number;
            limit?: number;
            role?: string;
            search?: string;
        }): Promise<PaginatedResponse<User>> {
            const url = buildUrl(apiConfig.endpoints.users.list, params);
            return apiClient.getPaginated<User>(url);
        },

        /**
         * Get user by ID
         */
        async get(id: string): Promise<User> {
            return apiClient.get<User>(apiConfig.endpoints.users.get(id));
        },

        /**
         * Update user
         */
        async update(id: string, data: UpdateUserData): Promise<User> {
            return apiClient.put<User>(
                apiConfig.endpoints.users.update(id),
                data
            );
        },

        /**
         * Delete user
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(apiConfig.endpoints.users.delete(id));
        },

        /**
         * Update user role
         */
        async updateRole(id: string, role: string): Promise<User> {
            return apiClient.patch<User>(
                apiConfig.endpoints.users.updateRole(id),
                { role }
            );
        },

        /**
         * Create new user (admin only)
         */
        async create(data: CreateUserData): Promise<User> {
            return apiClient.post<User>(apiConfig.endpoints.users.list, data);
        },

        /**
         * Update user status (admin only)
         */
        async updateStatus(
            id: string,
            status: "active" | "suspended"
        ): Promise<User> {
            return apiClient.patch<User>(
                `${apiConfig.endpoints.users.get(id)}/status`,
                { status }
            );
        },
    },

    // ========================================
    // STORES
    // ========================================
    stores: {
        /**
         * Get list of stores (public)
         */
        async list(params?: {
            latitude?: number;
            longitude?: number;
            radius?: number;
            city?: string;
            page?: number;
            limit?: number;
        }): Promise<PaginatedResponse<Store>> {
            const url = buildUrl(apiConfig.endpoints.stores.list, params);
            return apiClient.getPaginated<Store>(url);
        },

        /**
         * Get all stores including inactive (admin only)
         */
        async adminList(params?: {
            page?: number;
            limit?: number;
            city?: string;
            isActive?: boolean;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }): Promise<PaginatedResponse<Store>> {
            const url = buildUrl(apiConfig.endpoints.stores.adminList, params);
            return apiClient.getPaginated<Store>(url);
        },

        /**
         * Get store by ID
         */
        async get(id: string): Promise<Store> {
            return apiClient.get<Store>(apiConfig.endpoints.stores.get(id));
        },

        /**
         * Get store by Slug
         */
        async getBySlug(slug: string): Promise<Store> {
            return apiClient.get<Store>(
                apiConfig.endpoints.stores.getBySlug(slug)
            );
        },

        /**
         * Create store (admin only)
         */
        async create(data: CreateStoreData): Promise<Store> {
            return apiClient.post<Store>(
                apiConfig.endpoints.stores.create,
                data
            );
        },

        /**
         * Update store (admin only)
         */
        async update(id: string, data: UpdateStoreData): Promise<Store> {
            return apiClient.patch<Store>(
                apiConfig.endpoints.stores.update(id),
                data
            );
        },

        /**
         * Delete store (admin only)
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.stores.delete(id)
            );
        },

        /**
         * Toggle store status (admin only)
         */
        async toggleStatus(id: string): Promise<Store> {
            return apiClient.patch<Store>(
                apiConfig.endpoints.stores.toggleStatus(id)
            );
        },
    },

    // ========================================
    // PRODUCTS
    // ========================================
    products: {
        /**
         * Get list of products
         */
        async list(params?: {
            page?: number;
            limit?: number;
            category?: string;
            search?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
            isAvailable?: boolean;
        }): Promise<PaginatedResponse<Product>> {
            const url = buildUrl(apiConfig.endpoints.products.list, params);
            return apiClient.getPaginated<Product>(url);
        },

        /**
         * Search products
         * GET /api/products/search?q=query
         */
        async search(params: {
            q: string;
            page?: number;
            limit?: number;
            categoryId?: string;
            isFeatured?: boolean;
            isBestSelling?: boolean;
            tags?: string[];
            minPrice?: number;
            maxPrice?: number;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }): Promise<PaginatedResponse<Product>> {
            const url = buildUrl(apiConfig.endpoints.products.search, params);
            return apiClient.getPaginated<Product>(url);
        },

        /**
         * Get product by ID
         */
        async get(id: string): Promise<Product> {
            return apiClient.get<Product>(apiConfig.endpoints.products.get(id));
        },

        /**
         * Get product by slug
         * GET /api/products/slug/:slug
         */
        async getBySlug(slug: string): Promise<Product> {
            return apiClient.get<Product>(
                apiConfig.endpoints.products.getBySlug(slug)
            );
        },

        /**
         * Get product customizations
         * GET /api/products/:id/customizations
         */
        async getCustomizations(
            id: string
        ): Promise<ProductCustomizationsResponse> {
            return apiClient.get<ProductCustomizationsResponse>(
                apiConfig.endpoints.products.customizations(id)
            );
        },

        /**
         * Get product add-ons
         * GET /api/products/:id/addons
         */
        async getAddOns(id: string): Promise<ProductAddOnsResponse> {
            return apiClient.get<ProductAddOnsResponse>(
                apiConfig.endpoints.products.addons(id)
            );
        },

        /**
         * Create new product (admin only)
         */
        /**
         * Create new product (admin only)
         */
        async create(data: FormData | CreateProductData): Promise<Product> {
            const headers =
                data instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : undefined;
            return apiClient.post<Product>(
                apiConfig.endpoints.products.create,
                data,
                { headers }
            );
        },

        /**
         * Update product (admin only)
         */
        async update(
            id: string,
            data: FormData | UpdateProductData
        ): Promise<Product> {
            const headers =
                data instanceof FormData
                    ? { "Content-Type": "multipart/form-data" }
                    : undefined;
            return apiClient.patch<Product>(
                apiConfig.endpoints.products.update(id),
                data,
                { headers }
            );
        },

        /**
         * Delete product (admin only)
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.products.delete(id)
            );
        },

        /**
         * Update product status (admin only)
         */
        async updateStatus(id: string, isAvailable: boolean): Promise<Product> {
            return apiClient.patch<Product>(
                apiConfig.endpoints.products.updateStatus(id),
                { isAvailable }
            );
        },
        /**
         * Duplicate product (admin only)
         */
        async duplicate(id: string): Promise<Product> {
            return apiClient.post<Product>(
                apiConfig.endpoints.products.duplicate(id),
                {}
            );
        },
    },

    // ========================================
    // ORDERS
    // ========================================
    orders: {
        /**
         * Get list of orders
         */
        async list(params?: {
            page?: number;
            limit?: number;
            status?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }): Promise<PaginatedResponse<Order>> {
            const url = buildUrl(apiConfig.endpoints.orders.list, params);
            return apiClient.getPaginated<Order>(url);
        },

        /**
         * Get order by ID
         */
        async get(id: string): Promise<Order> {
            return apiClient.get<Order>(apiConfig.endpoints.orders.get(id));
        },

        /**
         * Create new order
         */
        async create(data: CreateOrderData): Promise<Order> {
            return apiClient.post<Order>(
                apiConfig.endpoints.orders.create,
                data
            );
        },

        /**
         * Update order status (admin only)
         */
        async updateStatus(
            id: string,
            status: string,
            notes?: string
        ): Promise<Order> {
            return apiClient.patch<Order>(
                apiConfig.endpoints.orders.updateStatus(id),
                { status, notes }
            );
        },

        /**
         * Cancel order
         */
        async cancel(id: string, reason?: string): Promise<Order> {
            return apiClient.post<Order>(
                apiConfig.endpoints.orders.cancel(id),
                {
                    reason,
                }
            );
        },

        /**
         * Get current user's orders
         */
        async myOrders(params?: {
            page?: number;
            limit?: number;
            status?: string;
        }): Promise<PaginatedResponse<Order>> {
            const url = buildUrl(apiConfig.endpoints.orders.myOrders, params);
            return apiClient.getPaginated<Order>(url);
        },
    },

    // ========================================
    // CART
    // ========================================
    cart: {
        /**
         * Get current cart
         */
        async get(): Promise<Cart> {
            return apiClient.get<Cart>(apiConfig.endpoints.cart.get);
        },

        /**
         * Add item to cart
         */
        async addItem(data: {
            productId: string;
            quantity: number;
            addons?: string[];
        }): Promise<Cart> {
            return apiClient.post<Cart>(apiConfig.endpoints.cart.addItem, data);
        },

        /**
         * Update cart item quantity
         */
        async updateItem(itemId: string, quantity: number): Promise<Cart> {
            return apiClient.patch<Cart>(
                apiConfig.endpoints.cart.updateItem(itemId),
                { quantity }
            );
        },

        /**
         * Remove item from cart
         */
        async removeItem(itemId: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.cart.removeItem(itemId)
            );
        },

        /**
         * Clear cart
         */
        async clear(): Promise<void> {
            return apiClient.delete<void>(apiConfig.endpoints.cart.clear);
        },
    },

    // ========================================
    // FAVORITES
    // ========================================
    favorites: {
        /**
         * Get user's favorites
         */
        async list(): Promise<FavoriteItem[]> {
            return apiClient.get<FavoriteItem[]>(
                apiConfig.endpoints.favorites.list
            );
        },

        /**
         * Add product to favorites
         */
        async add(productId: string): Promise<FavoriteItem> {
            return apiClient.post<FavoriteItem>(
                apiConfig.endpoints.favorites.add,
                {
                    productId,
                }
            );
        },

        /**
         * Remove product from favorites
         */
        async remove(productId: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.favorites.remove(productId)
            );
        },

        /**
         * Check if product is favorited
         */
        async check(productId: string): Promise<{ isFavorite: boolean }> {
            return apiClient.get<{ isFavorite: boolean }>(
                apiConfig.endpoints.favorites.check(productId)
            );
        },
    },

    // ========================================
    // NOTIFICATIONS
    // ========================================
    notifications: {
        /**
         * Get user's notifications
         */
        async list(params?: {
            page?: number;
            limit?: number;
            unreadOnly?: boolean;
        }): Promise<PaginatedResponse<Notification>> {
            const url = buildUrl(
                apiConfig.endpoints.notifications.list,
                params
            );
            return apiClient.getPaginated<Notification>(url);
        },

        /**
         * Mark notification as read
         */
        async markAsRead(id: string): Promise<void> {
            return apiClient.patch<void>(
                apiConfig.endpoints.notifications.markAsRead(id)
            );
        },

        /**
         * Mark all notifications as read
         */
        async markAllAsRead(): Promise<void> {
            return apiClient.patch<void>(
                apiConfig.endpoints.notifications.markAllAsRead
            );
        },

        /**
         * Delete notification
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.notifications.delete(id)
            );
        },
    },

    // ========================================
    // ADD-ONS
    // ========================================
    addons: {
        /**
         * Get list of add-ons
         */
        async list(): Promise<Addon[]> {
            return apiClient.get<Addon[]>(apiConfig.endpoints.addons.list);
        },

        /**
         * Get add-on by ID
         */
        async get(id: string): Promise<Addon> {
            return apiClient.get<Addon>(apiConfig.endpoints.addons.get(id));
        },

        /**
         * Create new add-on (admin only)
         */
        async create(data: CreateAddonData): Promise<Addon> {
            return apiClient.post<Addon>(
                apiConfig.endpoints.addons.create,
                data
            );
        },

        /**
         * Update add-on (admin only)
         */
        async update(id: string, data: UpdateAddonData): Promise<Addon> {
            return apiClient.put<Addon>(
                apiConfig.endpoints.addons.update(id),
                data
            );
        },

        /**
         * Delete add-on (admin only)
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.addons.delete(id)
            );
        },
    },

    // ========================================
    // REPORTS (Admin)
    // ========================================
    reports: {
        /**
         * Get dashboard statistics
         */
        async dashboard(params?: { period?: string }): Promise<DashboardStats> {
            const url = buildUrl(apiConfig.endpoints.reports.dashboard, params);
            return apiClient.get<DashboardStats>(url);
        },

        /**
         * Get sales report
         */
        async sales(params?: {
            startDate?: string;
            endDate?: string;
            groupBy?: string;
        }): Promise<SalesReport> {
            const url = buildUrl(apiConfig.endpoints.reports.sales, params);
            return apiClient.get<SalesReport>(url);
        },

        /**
         * Get orders report
         */
        async orders(params?: {
            startDate?: string;
            endDate?: string;
            status?: string;
        }): Promise<OrdersReport> {
            const url = buildUrl(apiConfig.endpoints.reports.orders, params);
            return apiClient.get<OrdersReport>(url);
        },

        /**
         * Get products report
         */
        async products(params?: { limit?: number }): Promise<ProductsReport> {
            const url = buildUrl(apiConfig.endpoints.reports.products, params);
            return apiClient.get<ProductsReport>(url);
        },

        /**
         * Get revenue report
         */
        async revenue(params?: {
            startDate?: string;
            endDate?: string;
            groupBy?: string;
        }): Promise<RevenueReport> {
            const url = buildUrl(apiConfig.endpoints.reports.revenue, params);
            return apiClient.get<RevenueReport>(url);
        },

        /**
         * Export report as CSV
         */
        async export(params: {
            type: string;
            startDate?: string;
            endDate?: string;
        }): Promise<Blob> {
            const url = buildUrl(apiConfig.endpoints.reports.export, params);
            // Use fetch for blob response
            const response = await fetch(url);
            return response.blob();
        },
    },

    // ========================================
    // CONFIG (Admin)
    // ========================================
    config: {
        /**
         * Get application configuration
         */
        async get(): Promise<AppConfig> {
            return apiClient.get<AppConfig>(apiConfig.endpoints.config.get);
        },

        /**
         * Update application configuration (admin only)
         */
        async update(data: Partial<AppConfig>): Promise<AppConfig> {
            return apiClient.put<AppConfig>(
                apiConfig.endpoints.config.update,
                data
            );
        },

        /**
         * Get delivery zones
         */
        async getDeliveryZones(): Promise<DeliveryZone[]> {
            return apiClient.get<DeliveryZone[]>(
                apiConfig.endpoints.config.deliveryZones
            );
        },

        /**
         * Create delivery zone (admin only)
         */
        async createDeliveryZone(
            data: CreateDeliveryZoneData
        ): Promise<DeliveryZone> {
            return apiClient.post<DeliveryZone>(
                apiConfig.endpoints.config.createDeliveryZone,
                data
            );
        },

        /**
         * Update delivery zone (admin only)
         */
        async updateDeliveryZone(
            id: string,
            data: UpdateDeliveryZoneData
        ): Promise<DeliveryZone> {
            return apiClient.put<DeliveryZone>(
                apiConfig.endpoints.config.updateDeliveryZone(id),
                data
            );
        },

        /**
         * Delete delivery zone (admin only)
         */
        async deleteDeliveryZone(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.config.deleteDeliveryZone(id)
            );
        },
    },

    // ========================================
    // SUPPORT
    // ========================================
    support: {
        /**
         * Get support tickets
         */
        async getTickets(params?: {
            page?: number;
            limit?: number;
            status?: string;
        }): Promise<PaginatedResponse<SupportTicket>> {
            const url = buildUrl(apiConfig.endpoints.support.tickets, params);
            return apiClient.get<PaginatedResponse<SupportTicket>>(url);
        },

        /**
         * Create support ticket
         */
        async createTicket(data: {
            subject: string;
            category: string;
            priority: string;
            message: string;
        }): Promise<SupportTicket> {
            return apiClient.post<SupportTicket>(
                apiConfig.endpoints.support.createTicket,
                data
            );
        },

        /**
         * Get ticket by ID
         */
        async getTicket(id: string): Promise<SupportTicket> {
            return apiClient.get<SupportTicket>(
                apiConfig.endpoints.support.getTicket(id)
            );
        },

        /**
         * Update ticket
         */
        async updateTicket(
            id: string,
            data: Partial<SupportTicket>
        ): Promise<SupportTicket> {
            return apiClient.patch<SupportTicket>(
                apiConfig.endpoints.support.updateTicket(id),
                data
            );
        },

        /**
         * Add message to ticket
         */
        async addMessage(id: string, message: string): Promise<SupportTicket> {
            return apiClient.post<SupportTicket>(
                apiConfig.endpoints.support.addMessage(id),
                { message }
            );
        },
    },

    // ========================================
    // PROFILE (Authenticated User)
    // ========================================
    profile: {
        /**
         * Get current user's profile
         */
        async get(): Promise<UserProfile> {
            return apiClient.get<UserProfile>(apiConfig.endpoints.profile.get);
        },

        /**
         * Update current user's profile
         */
        async update(data: UpdateProfileData): Promise<UserProfile> {
            return apiClient.put<UserProfile>(
                apiConfig.endpoints.profile.update,
                data
            );
        },

        /**
         * Upload profile image
         */
        async uploadImage(imageUrl: string): Promise<{ profileImage: string }> {
            return apiClient.post<{ profileImage: string }>(
                apiConfig.endpoints.profile.uploadImage,
                { imageUrl }
            );
        },

        /**
         * Update password
         */
        async updatePassword(
            data: UpdatePasswordData
        ): Promise<{ message: string }> {
            return apiClient.put<{ message: string }>(
                apiConfig.endpoints.profile.updatePassword,
                data
            );
        },

        /**
         * Update settings/preferences
         */
        async updateSettings(data: UpdateSettingsData): Promise<UserProfile> {
            return apiClient.put<UserProfile>(
                apiConfig.endpoints.profile.updateSettings,
                data
            );
        },

        /**
         * Get referral statistics
         */
        async getReferralStats(): Promise<ReferralStats> {
            return apiClient.get<ReferralStats>(
                apiConfig.endpoints.profile.referralStats
            );
        },

        /**
         * Delete account
         */
        async deleteAccount(
            data: DeleteAccountData
        ): Promise<{ message: string }> {
            return apiClient.delete<{ message: string }>(
                apiConfig.endpoints.profile.delete,
                { data }
            );
        },
    },

    // ========================================
    // CATEGORIES
    // ========================================
    categories: {
        /**
         * Get list of categories
         */
        async list(params?: {
            page?: number;
            limit?: number;
            storeId?: string;
            isActive?: boolean;
            search?: string;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
        }): Promise<PaginatedResponse<Category>> {
            const url = buildUrl(apiConfig.endpoints.categories.list, params);
            return apiClient.getPaginated<Category>(url);
        },

        /**
         * Get category by ID
         */
        async get(id: string): Promise<Category> {
            return apiClient.get<Category>(
                apiConfig.endpoints.categories.get(id)
            );
        },

        /**
         * Create category
         */
        async create(data: CreateCategoryData): Promise<Category> {
            return apiClient.post<Category>(
                apiConfig.endpoints.categories.create,
                data
            );
        },

        /**
         * Update category
         */
        async update(id: string, data: UpdateCategoryData): Promise<Category> {
            return apiClient.patch<Category>(
                apiConfig.endpoints.categories.update(id),
                data
            );
        },

        /**
         * Delete category
         */
        async delete(id: string): Promise<void> {
            return apiClient.delete<void>(
                apiConfig.endpoints.categories.delete(id)
            );
        },
    },

    announcement: {},

    // ========================================
    // HEALTH
    // ========================================
    health: {
        /**
         * Check API health
         */
        async check(): Promise<{ status: string; timestamp: string }> {
            return apiClient.get<{ status: string; timestamp: string }>(
                apiConfig.endpoints.health
            );
        },
    },
};

// Export client instances
export { apiClient, fetchClient, ApiClientError };

// Export config
export { apiConfig };
