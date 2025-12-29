export interface Announcement {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    actionType: "promo_code" | "deep_link" | "external_url" | "none";
    actionValue?: string;
    priority: number;
    targetAudience: "all" | "new_users" | "loyal_users" | "specific_tier";
    userTierFilter?: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    viewCount: number;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
}

export type CreateAnnouncementData = Omit<
    Announcement,
    "id" | "viewCount" | "clickCount" | "createdAt" | "updatedAt"
>;

export type UpdateAnnouncementData = Partial<CreateAnnouncementData>;
