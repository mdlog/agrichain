/**
 * API Route: Get Single NFT by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNFTById } from '@/lib/nftDatabase'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const nft = getNFTById(params.id)

        if (!nft) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'NFT not found'
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: nft
        })

    } catch (error: any) {
        console.error('Error fetching NFT:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch NFT'
            },
            { status: 500 }
        )
    }
}
