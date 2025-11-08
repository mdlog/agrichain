/**
 * API Client with CSRF Protection
 * Automatically includes CSRF token in requests
 */

let csrfToken: string | null = null

/**
 * Fetch CSRF token from server
 */
async function fetchCSRFToken(): Promise<string> {
    if (csrfToken) {
        return csrfToken
    }

    try {
        const response = await fetch('/api/csrf-token')
        const data = await response.json()

        if (data.success && data.token) {
            csrfToken = data.token
            return csrfToken
        }

        throw new Error('Failed to fetch CSRF token')
    } catch (error) {
        console.error('Error fetching CSRF token:', error)
        throw error
    }
}

/**
 * Make API request with CSRF protection
 */
export async function apiRequest<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const method = options.method?.toUpperCase() || 'GET'
    const needsCSRF = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

    // Get CSRF token for protected methods
    if (needsCSRF) {
        const token = await fetchCSRFToken()

        options.headers = {
            ...options.headers,
            'X-CSRF-Token': token,
            'Content-Type': 'application/json'
        }
    }

    const response = await fetch(url, options)

    // If CSRF token is invalid, refresh and retry once
    if (response.status === 403 && needsCSRF) {
        csrfToken = null // Clear cached token
        const newToken = await fetchCSRFToken()

        options.headers = {
            ...options.headers,
            'X-CSRF-Token': newToken
        }

        const retryResponse = await fetch(url, options)
        return retryResponse.json()
    }

    return response.json()
}

/**
 * Convenience methods
 */
export const api = {
    get: <T = any>(url: string, options?: RequestInit) =>
        apiRequest<T>(url, { ...options, method: 'GET' }),

    post: <T = any>(url: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        }),

    put: <T = any>(url: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    patch: <T = any>(url: string, data?: any, options?: RequestInit) =>
        apiRequest<T>(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        }),

    delete: <T = any>(url: string, options?: RequestInit) =>
        apiRequest<T>(url, { ...options, method: 'DELETE' })
}
