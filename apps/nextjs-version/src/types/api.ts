/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiErrorResponse {
  success: boolean
  message: string
  errorCode: string
  errors: any[]
  stack?: string
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean
}
