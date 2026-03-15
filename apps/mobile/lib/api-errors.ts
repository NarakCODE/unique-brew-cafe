import type { ApiErrorResponse } from '../../../packages/api/src';

const DEFAULT_ERROR_CODE = 'UNKNOWN_ERROR';

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    'success' in error &&
    typeof error.success === 'boolean'
  );
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage = 'Something went wrong.'
): ApiErrorResponse {
  if (isApiErrorResponse(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || fallbackMessage,
      errorCode: DEFAULT_ERROR_CODE,
      errors: [],
      stack: error.stack,
    };
  }

  return {
    success: false,
    message: fallbackMessage,
    errorCode: DEFAULT_ERROR_CODE,
    errors: [],
  };
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Something went wrong.'
) {
  return normalizeApiError(error, fallbackMessage).message;
}
