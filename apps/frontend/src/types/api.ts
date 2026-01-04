// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    data: T;
    message: string;
}

export interface PaginatedData<T> {
    items: T[];
    pagination: {
        page: number;
        pages: number;
        total: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

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
