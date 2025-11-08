/**
 * Client-side CSRF token management
 * Fetches token from API endpoint to ensure consistency
 */

let cachedToken: string | null = null

export async function getCSRFToken(): Promise<string> {
    // Return cached token if available
    if (cachedToken) {
        console.log('✅ Using cached CSRF token:', cachedToken.substring(0, 10) + '...')
        return cachedToken
    }

    // Try to get from cookie first
    const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1]

    if (cookieToken) {
        console.log('✅ CSRF token found in cookie:', cookieToken.substring(0, 10) + '...')
        cachedToken = cookieToken
        return cookieToken
    }

    // If not in cookie, fetch from API to trigger middleware
    console.warn('⚠️ CSRF token not in cookie, fetching from API...')
    try {
        const response = await fetch('/api/csrf-token')
        const data = await response.json()

        if (data.token) {
            console.log('✅ Received CSRF token from API:', data.token.substring(0, 10) + '...')
            cachedToken = data.token
            return data.token
        }
    } catch (error) {
        console.error('❌ Failed to fetch CSRF token from API:', error)
    }

    // Last resort: generate client-side token
    console.warn('⚠️ Generating client-side CSRF token as fallback')
    const newToken = generateClientToken()
    document.cookie = `csrf-token=${newToken}; path=/; max-age=${60 * 60 * 24}; samesite=strict`
    cachedToken = newToken
    return newToken
}

function generateClientToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getCSRFToken()

    const headers = new Headers(options.headers)
    headers.set('x-csrf-token', token)

    return fetch(url, {
        ...options,
        headers
    })
}
