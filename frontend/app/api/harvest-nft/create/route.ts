/**
 * API Route: Create Harvest NFT
 * Creates NFT on Hedera and registers it in smart contract
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHarvestNFT } from '@/lib/harvestNFT'
import { ethers } from 'ethers'

// Import contract ABIs
const HarvestTokenNFTABI = require('@/contracts/HarvestTokenNFT.json')

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate required fields
        const requiredFields = [
            'farmerAddress',
            'cropType',
            'expectedYield',
            'estimatedValue',
            'harvestDate',
            'farmLocation',
            'farmSize',
            'farmerName'
        ]

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing field: ${field}` },
                    { status: 400 }
                )
            }
        }

        // Validate data types
        if (typeof body.expectedYield !== 'number' || body.expectedYield <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid expectedYield' },
                { status: 400 }
            )
        }

        if (typeof body.estimatedValue !== 'number' || body.estimatedValue <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid estimatedValue' },
                { status: 400 }
            )
        }

        // Validate harvest date is in future
        const harvestDate = new Date(body.harvestDate)
        if (harvestDate <= new Date()) {
            return NextResponse.json(
                { success: false, error: 'Harvest date must be in future' },
                { status: 400 }
            )
        }

        console.log('📝 Creating Harvest NFT...')
        console.log('Farmer:', body.farmerAddress)
        console.log('Crop:', body.cropType)
        console.log('Value:', body.estimatedValue, 'HBAR')

        // STEP 1: Create NFT on Hedera
        const nft = await createHarvestNFT(
            body.farmerAddress,
            {
                cropType: body.cropType,
                expectedYield: body.expectedYield,
                estimatedValue: body.estimatedValue,
                harvestDate: body.harvestDate,
                farmLocation: body.farmLocation,
                farmSize: body.farmSize,
                farmerName: body.farmerName,
                farmerAddress: body.farmerAddress
            }
        )

        console.log('✅ NFT Created:', nft.tokenId)

        // STEP 2: Register NFT in smart contract
        console.log('📝 Registering NFT in smart contract...')

        const provider = new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_HEDERA_RPC_URL || 'https://testnet.hashio.io/api'
        )

        const wallet = new ethers.Wallet(
            process.env.HEDERA_PRIVATE_KEY || '',
            provider
        )

        const harvestNFTContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_HARVEST_NFT_CONTRACT || '',
            HarvestTokenNFTABI.abi,
            wallet
        )

        // Convert token ID to address format (0x...)
        const tokenIdAddress = `0x${Buffer.from(nft.tokenId).toString('hex').padStart(40, '0')}`

        // Prepare metadata for contract
        const metadata = {
            cropType: body.cropType,
            expectedYield: body.expectedYield,
            estimatedValue: ethers.parseEther(body.estimatedValue.toString()),
            harvestDate: Math.floor(harvestDate.getTime() / 1000),
            farmLocation: body.farmLocation,
            farmSize: body.farmSize,
            farmer: body.farmerAddress,
            createdAt: Math.floor(Date.now() / 1000),
            isActive: true
        }

        const tx = await harvestNFTContract.registerHarvestNFT(
            tokenIdAddress,
            parseInt(nft.serialNumber),
            metadata
        )

        const receipt = await tx.wait()

        console.log('✅ NFT Registered in contract')
        console.log('Transaction:', receipt.hash)

        // Return success response
        return NextResponse.json({
            success: true,
            data: {
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                metadata: nft.metadata,
                explorerUrl: nft.explorerUrl,
                contractTx: receipt.hash
            }
        })

    } catch (error: any) {
        console.error('❌ Error creating harvest NFT:', error)

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to create harvest NFT'
            },
            { status: 500 }
        )
    }
}
