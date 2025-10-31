/**
 * API Route: Get NFTs
 * Fetch NFTs from database (online storage)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAllNFTs, getNFTsByFarmer, getNFTCount } from '@/lib/nftDatabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const farmerAddress = searchParams.get('farmer')
        const limit = searchParams.get('limit')
        const offset = searchParams.get('offset')

        // Get NFTs by farmer
        if (farmerAddress) {
            const nfts = getNFTsByFarmer(farmerAddress)
            return NextResponse.json({
                success: true,
                data: nfts,
                count: nfts.length
            })
        }

        // Get all NFTs with pagination
        const limitNum = limit ? parseInt(limit) : undefined
        const offsetNum = offset ? parseInt(offset) : undefined

        const nfts = getAllNFTs(limitNum, offsetNum)
        const totalCount = getNFTCount()

        return NextResponse.json({
            success: true,
            data: nfts,
            count: nfts.length,
            total: totalCount
        })

    } catch (error: any) {
        console.error('Error fetching NFTs:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch NFTs'
            },
            { status: 500 }
        )
    }
}
