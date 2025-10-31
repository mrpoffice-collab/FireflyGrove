/**
 * API Client with Error Handling and Retry Logic
 *
 * Provides a centralized way to make API calls with:
 * - Automatic retry on network errors
 * - Exponential backoff
 * - Timeout handling
 * - Type-safe error responses
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ApiResponse<T> {
  data?: T
  error?: string
  success?: boolean
}

/**
 * Enhanced fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true
  }

  // Abort errors (timeout)
  if (error.name === 'AbortError') {
    return true
  }

  // 5xx server errors (but not 501 Not Implemented)
  if (error instanceof ApiError && error.status) {
    return error.status >= 500 && error.status !== 501
  }

  return false
}

/**
 * Make an API call with automatic retry and error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        timeout,
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      // Try to parse JSON response
      const data = await response.json()
      return data as T
    } catch (error: any) {
      lastError = error

      // Don't retry if not retryable or on last attempt
      if (!isRetryableError(error) || attempt === retries) {
        break
      }

      // Exponential backoff: delay * (2 ^ attempt)
      const delay = retryDelay * Math.pow(2, attempt)
      console.warn(
        `API call to ${url} failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`,
        error
      )
      await sleep(delay)
    }
  }

  // All retries exhausted
  if (lastError instanceof ApiError) {
    throw lastError
  }

  // Network or timeout error
  throw new ApiError(
    lastError?.message || 'Network request failed. Please check your connection.',
    undefined,
    lastError
  )
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiCall<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(url: string, body?: any, options?: FetchOptions) =>
    apiCall<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiCall<T>(url, { ...options, method: 'DELETE' }),
}

/**
 * Helper to format error messages for user display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}
