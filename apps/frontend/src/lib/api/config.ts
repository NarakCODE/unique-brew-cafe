// API Configuration

import { API_BASE_URL } from "@/lib/utils/constants";

export const apiConfig = {
    // Base URL for the API
    baseURL: API_BASE_URL,

    // Timeout for requests (in milliseconds)
    timeout: 30000, // 30 seconds

    // Endpoints
    endpoints: {
        // Auth
        auth: {
            login: "/auth/login",
            register: "/auth/register", // Legacy
            initiateRegistration: "/auth/register/initiate",
            verifyRegistration: "/auth/register/verify",
            logout: "/auth/logout",
            refresh: "/auth/refresh",
            verifyEmail: "/auth/verify-email",
            resendVerification: "/auth/resend-otp", // Updated to match backend
            forgotPassword: "/auth/forgot-password",
            resetPassword: "/auth/reset-password",
            me: "/auth/me",
        },

        // Users
        users: {
            list: "/users",
            get: (id: string) => `/users/${id}`,
            update: (id: string) => `/users/${id}`,
            delete: (id: string) => `/users/${id}`,
            updateRole: (id: string) => `/users/${id}/role`,
        },

        // Stores
        stores: {
            list: "/stores",
            adminList: "/stores/admin/all",
            get: (id: string) => `/stores/${id}`,
            getBySlug: (slug: string) => `/stores/slug/${slug}`,
            create: "/stores",
            update: (id: string) => `/stores/${id}`,
            delete: (id: string) => `/stores/${id}`,
            toggleStatus: (id: string) => `/stores/${id}/status`,
            pickupTimes: (id: string) => `/stores/${id}/pickup-times`,
            gallery: (id: string) => `/stores/${id}/gallery`,
            hours: (id: string) => `/stores/${id}/hours`,
            location: (id: string) => `/stores/${id}/location`,
            menu: (id: string) => `/stores/${id}/menu`,
        },

        // Orders
        orders: {
            list: "/orders",
            get: (id: string) => `/orders/${id}`,
            create: "/orders",
            update: (id: string) => `/orders/${id}`,
            updateStatus: (id: string) => `/orders/${id}/status`,
            cancel: (id: string) => `/orders/${id}/cancel`,
            myOrders: "/orders/my-orders",
        },

        // Cart
        cart: {
            get: "/cart",
            addItem: "/cart/items",
            updateItem: (itemId: string) => `/cart/items/${itemId}`,
            removeItem: (itemId: string) => `/cart/items/${itemId}`,
            clear: "/cart",
        },

        // Favorites
        favorites: {
            list: "/favorites",
            add: "/favorites",
            remove: (productId: string) => `/favorites/${productId}`,
            check: (productId: string) => `/favorites/${productId}/check`,
        },

        // Notifications
        notifications: {
            list: "/notifications",
            markAsRead: (id: string) => `/notifications/${id}/read`,
            markAllAsRead: "/notifications/read-all",
            delete: (id: string) => `/notifications/${id}`,
        },

        // Add-ons
        addons: {
            list: "/addons",
            get: (id: string) => `/addons/${id}`,
            create: "/addons",
            update: (id: string) => `/addons/${id}`,
            delete: (id: string) => `/addons/${id}`,
        },

        // Reports (Admin)
        reports: {
            dashboard: "/reports/dashboard",
            sales: "/reports/sales",
            orders: "/reports/orders",
            products: "/reports/products",
            revenue: "/reports/revenue",
            export: "/reports/export",
        },

        // Config (Admin)
        config: {
            get: "/config",
            update: "/config",
            deliveryZones: "/config/delivery-zones",
            createDeliveryZone: "/config/delivery-zones",
            updateDeliveryZone: (id: string) => `/config/delivery-zones/${id}`,
            deleteDeliveryZone: (id: string) => `/config/delivery-zones/${id}`,
        },

        // Support
        support: {
            tickets: "/support/tickets",
            createTicket: "/support/tickets",
            getTicket: (id: string) => `/support/tickets/${id}`,
            updateTicket: (id: string) => `/support/tickets/${id}`,
            addMessage: (id: string) => `/support/tickets/${id}/messages`,
        },

        // Profile (authenticated user)
        profile: {
            get: "/profile",
            update: "/profile",
            uploadImage: "/profile/image",
            updatePassword: "/profile/password",
            updateSettings: "/profile/settings",
            referralStats: "/profile/referral",
            delete: "/profile",
        },

        // Categories
        categories: {
            list: "/categories",
            get: (id: string) => `/categories/${id}`,
            create: "/categories",
            update: (id: string) => `/categories/${id}`,
            delete: (id: string) => `/categories/${id}`,
        },
        // Products
        products: {
            list: "/products",
            search: "/products/search",
            get: (id: string) => `/products/${id}`,
            getBySlug: (slug: string) => `/products/slug/${slug}`,
            customizations: (id: string) => `/products/${id}/customizations`,
            addons: (id: string) => `/products/${id}/addons`,
            create: "/products",
            update: (id: string) => `/products/${id}`,
            delete: (id: string) => `/products/${id}`,
            updateStatus: (id: string) => `/products/${id}/status`,
            duplicate: (id: string) => `/products/${id}/duplicate`,
        },

        // Health
        health: "/health",
    },

    // Retry configuration
    retry: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
    },

    // Cache configuration
    cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
    },
} as const;

export type ApiConfig = typeof apiConfig;
