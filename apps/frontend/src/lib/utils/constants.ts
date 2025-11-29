// App constants
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export const ORDER_STATUSES = [
    "pending_payment",
    "confirmed",
    "preparing",
    "ready",
    "picked_up",
    "completed",
    "cancelled",
] as const;

export const PAYMENT_STATUSES = [
    "pending",
    "processing",
    "completed",
    "failed",
    "refunded",
] as const;

export const USER_ROLES = ["user", "admin", "moderator"] as const;

export const LOYALTY_TIERS = ["bronze", "silver", "gold", "platinum"] as const;
