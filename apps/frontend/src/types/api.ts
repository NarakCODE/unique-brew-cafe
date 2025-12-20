// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        pages: number;
        total: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
}

export interface ApiValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ApiError {
    success: false;
    message: string;
    errorCode: string;
    errors?: ApiValidationError[];
    stack?: string;
}
