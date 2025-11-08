/**
 * Next.js Middleware
 * Handles CSRF protection and security headers
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateCSRFToken, verifyCSRFToken } from '@/lib/csrf'

// Routes that require CSRF protection
const PROTECTED_ROUTES = [
    '/api/harvest-nft/create',
    '/api/verifications'
]

// Methods that require CSRF protection
const PROTECTED_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const method = request.method

    // Check if route requires CSRF protection
    const requiresCSRF = PROTECTED_ROUTES.some(route => pathname.startsWith(route)) &&
        PROTECTED_METHODS.has(method)

    if (requiresCSRF) {
        console.log('🔐 Middleware: CSRF validation required for:', pathname)

        // Verify CSRF token
        const isValid = verifyCSRFToken(request)

        console.log('🔐 Middleware: CSRF validation result:', isValid)
        console.log('🔐 Middleware: Request headers:', {
            'x-csrf-token': request.headers.get('x-csrf-token')?.substring(0, 10) + '...',
            'cookie': request.cookies.get('csrf-token')?.value?.substring(0, 10) + '...'
        })

        if (!isValid) {
            console.error('❌ Middleware: CSRF validation failed!')
            return NextResponse.json(
                { success: false, error: 'Invalid CSRF token' },
                { status: 403 }
            )
        }
    }

    // Create response
    const response = NextResponse.next()

    // Set security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://testnet.hashio.io https://testnet.mirrornode.hedera.com https://api.web3modal.org https://pulse.walletconnect.org https://cca-lite.coinbase.com wss://*.walletconnect.com wss://*.walletconnect.org"
    )

    // Always ensure CSRF token is set in response
    const existingToken = request.cookies.get('csrf-token')?.value
    const tokenToUse = existingToken || generateCSRFToken()

    if (!existingToken) {
        console.log('🔐 Middleware: Setting new CSRF token:', tokenToUse.substring(0, 10) + '...')
    } else {
        console.log('🔐 Middleware: Using existing CSRF token:', tokenToUse.substring(0, 10) + '...')
    }

    // Always set the cookie in response to ensure it's available
    response.cookies.set('csrf-token', tokenToUse, {
        httpOnly: false, // Allow JavaScript to read for sending in headers
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // Ensure cookie is available for all paths
        maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
}
