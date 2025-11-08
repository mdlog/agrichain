/**
 * CSRF Protection Utility
 * Implements CSRF token generation and validation
 * Uses Web Crypto API for Edge runtime compatibility
 */

import { NextRequest } from 'next/server'

const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a CSRF token using Web Crypto API
 */
export function generateCSRFToken(): string {
    const array = new Uint8Array(CSRF_TOKEN_LENGTH)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token using constant-time comparison to prevent timing attacks
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) {
        return false
    }

    // Ensure both tokens are the same length to prevent timing attacks
    if (token.length !== expectedToken.length) {
        return false
    }

    // Use constant-time comparison to prevent timing attacks
    let result = 0
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
    }

    return result === 0
}

/**
 * Extract CSRF token from request headers
 */
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
    return request.headers.get('x-csrf-token')
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(request: NextRequest): boolean {
    const token = getCSRFTokenFromRequest(request)
    const sessionToken = request.cookies.get('csrf-token')?.value

    if (!token || !sessionToken) {
        return false
    }

    return validateCSRFToken(token, sessionToken)
}
