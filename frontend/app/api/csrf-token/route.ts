/**
 * API Route: Get CSRF Token
 * Returns the CSRF token from cookie (set by middleware)
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('csrf-token')?.value

    if (!token) {
        return NextResponse.json(
            { success: false, error: 'CSRF token not found' },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        token
    })
}
