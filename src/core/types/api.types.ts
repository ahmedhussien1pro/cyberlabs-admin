export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}
