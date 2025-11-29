/**
 * Pagination utility for consistent pagination across the API
 */

export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CursorPaginationParams {
  cursor?: string | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    limit: number;
    nextCursor?: string | undefined;
    hasNext: boolean;
  };
}

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 1 | -1;
} {
  const page = Math.max(1, parseInt(String(params.page || DEFAULT_PAGE), 10));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(params.limit || DEFAULT_LIMIT), 10))
  );
  const skip = (page - 1) * limit;
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

  return { page, limit, skip, sortBy, sortOrder };
}

/**
 * Build pagination result object
 */
export function buildPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Parse cursor pagination parameters
 */
export function parseCursorPaginationParams(params: CursorPaginationParams): {
  cursor?: string | undefined;
  limit: number;
  sortBy: string;
  sortOrder: 1 | -1;
} {
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(params.limit || DEFAULT_LIMIT), 10))
  );
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

  return { cursor: params.cursor, limit, sortBy, sortOrder };
}

/**
 * Build cursor pagination result
 */
export function buildCursorPaginationResult<T extends { _id: unknown }>(
  data: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasNext = data.length > limit;
  const items = hasNext ? data.slice(0, limit) : data;
  const lastItem = items[items.length - 1];
  const nextCursor: string | undefined =
    hasNext && lastItem
      ? Buffer.from(String(lastItem._id)).toString('base64')
      : undefined;

  return {
    data: items,
    pagination: {
      limit,
      nextCursor,
      hasNext,
    },
  };
}

/**
 * Decode cursor to ObjectId
 */
export function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, 'base64').toString('utf-8');
  } catch {
    throw new Error('Invalid cursor');
  }
}
