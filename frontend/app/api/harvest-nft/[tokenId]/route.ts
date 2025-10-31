/**
 * API Route: Get Harvest NFT Details
 * Fetches NFT metadata from Hedera mirror node
 */

import { NextRequest, NextResponse } from 'next/server'
import { getNFTMetadata } from '@/lib/harvestNFT'

export async function GET(
    request: NextRequest,
    { params }: { params: { tokenId: string } }
) {
    try {
        const { tokenId } = params
        const { searchParams } = new URL(request.url)
        const serialNumber = searchParams.get('serial')

        if (!serialNumber) {
            return NextResponse.json(
                { success: false, error: 'Serial number required' },
                { status: 400 }
            )
        }

        console.log('📝 Fetching NFT metadata...')
        console.log('Token ID:', tokenId)
        console.log('Serial:', serialNumber)

        const metadata = await getNFTMetadata(tokenId, serialNumber)

        if (!metadata) {
            return NextResponse.json(
                { success: false, error: 'NFT not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                tokenId,
                serialNumber,
                metadata,
                explorerUrl: `https://hashscan.io/testnet/token/${tokenId}`
            }
        })

    } catch (error: any) {
        console.error('❌ Error fetching NFT:', error)

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch NFT'
            },
            { status: 500 }
        )
    }
}
