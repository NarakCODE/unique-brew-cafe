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
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
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
