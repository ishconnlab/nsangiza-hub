export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  [key: string]: unknown
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  code?: string
  errors?: unknown[]
  meta?: ApiMeta
}

export function ok<T>(data: T, message = 'Success', meta?: ApiMeta): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data, message }
  if (meta) response.meta = meta
  return response
}

export function fail(message = 'Something went wrong', code = 'ERROR', meta?: ApiMeta): ApiResponse<null> {
  const response: ApiResponse<null> = { success: false, data: null, message, code }
  if (meta) response.meta = meta
  return response
}

export function paginated<T>(data: T, page: number, pageSize: number, total: number, meta: ApiMeta = {}): ApiResponse<T> {
  return ok(data, 'Success', {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    ...meta,
  })
}