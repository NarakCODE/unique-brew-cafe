// User Types
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";
export type UserStatus = "active" | "suspended" | "deleted";

export interface User {
    id: string;
    email: string;
    fullName: string;
    profileImage?: string;
    role: "user" | "admin" | "moderator";
    status: UserStatus;
    loyaltyTier: LoyaltyTier;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
    lastLoginAt?: string;
}

export type UpdateUserData = Partial<
    Pick<User, "fullName" | "profileImage" | "status" | "role">
>;
