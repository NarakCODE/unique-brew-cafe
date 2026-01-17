export interface NotificationAdmin {
  _id: string; // The user provided example shows "_id" inside adminId, but "id" at the root level.
  id?: string; // Sometimes response include id at root level
  adminId: {
    _id: string;
    fullName: string;
    email: string;
  };
  type: string; // "individual" | ...
  recipientCount: number;
  successCount: number;
  failureCount: number;
  title: string;
  message: string;
  createdAt: string;
}

export interface NotificationResponse {
  statusCode: number;
  data: NotificationAdmin[];
  message: string;
  success: boolean;
}

export interface NotificationCountResponse {
  statusCode: number;
  data: {
    count: number;
  };
  message: string;
  success: boolean;
}

export interface TypeDistribution {
  _id: string;
  count: number;
}

export interface NotificationStats {
  totalSent: number;
  readCount: number;
  unreadCount: number;
  readRate: number;
  typeDistribution: TypeDistribution[];
}

export interface NotificationStatsResponse {
  statusCode: number;
  data: NotificationStats;
  message: string;
  success: boolean;
}
