/**
 * API Route: Create Harvest NFT
 * Creates NFT on Hedera and registers it in smart contract
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHarvestNFT } from '@/lib/harvestNFT'
import { saveNFT } from '@/lib/nftDatabase'
import { ethers } from 'ethers'
import { safeLogger, escapeHtml, validateEthereumAddress } from '@/lib/security'

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

        // Validate Ethereum address format
        if (!validateEthereumAddress(body.farmerAddress)) {
            return NextResponse.json(
                { success: false, error: 'Invalid farmer address format' },
                { status: 400 }
            )
        }

        // Sanitize string inputs to prevent XSS
        body.cropType = escapeHtml(body.cropType)
        body.farmLocation = escapeHtml(body.farmLocation)
        body.farmerName = escapeHtml(body.farmerName)

        // Validate harvest date is in future
        const harvestDate = new Date(body.harvestDate)
        if (harvestDate <= new Date()) {
            return NextResponse.json(
                { success: false, error: 'Harvest date must be in future' },
                { status: 400 }
            )
        }

        safeLogger.log('📝 Creating Harvest NFT...')
        safeLogger.log('Farmer:', body.farmerAddress)
        safeLogger.log('Crop:', body.cropType)
        safeLogger.log('Value:', body.estimatedValue, 'HBAR')

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

        safeLogger.log('✅ NFT Created:', nft.tokenId)

        // STEP 2: Register NFT in smart contract
        safeLogger.log('📝 Registering NFT in smart contract...')

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

        safeLogger.log('✅ NFT Registered in contract')
        safeLogger.log('Transaction:', receipt.hash)

        // Extract internal ID from event
        let internalId = null
        try {
            const registeredEvent = receipt.logs.find((log: any) => {
                try {
                    const parsed = harvestNFTContract.interface.parseLog(log)
                    return parsed && parsed.name === 'HarvestNFTRegistered'
                } catch {
                    return false
                }
            })

            if (registeredEvent) {
                const parsedEvent = harvestNFTContract.interface.parseLog(registeredEvent)
                if (parsedEvent) {
                    internalId = parsedEvent.args[0].toString() // First arg is internalId
                    safeLogger.log('✅ Internal ID:', internalId)
                }
            }
        } catch (error) {
            safeLogger.warn('Could not extract internal ID from event:', error)
        }

        // STEP 3: Save to database for online access
        safeLogger.log('💾 Saving NFT to database...')

        const nftRecord = {
            id: `${nft.tokenId}-${nft.serialNumber}`,
            tokenId: nft.tokenId,
            serialNumber: nft.serialNumber,
            internalId: internalId ? parseInt(internalId) : null,
            farmerAddress: body.farmerAddress,
            farmerName: body.farmerName,
            metadata: {
                cropType: body.cropType,
                expectedYield: body.expectedYield,
                estimatedValue: body.estimatedValue,
                harvestDate: body.harvestDate,
                farmLocation: body.farmLocation,
                farmSize: body.farmSize,
                isActive: true
            },
            createdAt: new Date().toISOString(),
            explorerUrl: nft.explorerUrl,
            contractTx: receipt.hash
        }

        saveNFT(nftRecord)
        safeLogger.log('✅ NFT saved to database')

        // Return success response
        return NextResponse.json({
            success: true,
            data: {
                tokenId: nft.tokenId,
                serialNumber: nft.serialNumber,
                internalId: internalId,
                metadata: nft.metadata,
                explorerUrl: nft.explorerUrl,
                contractTx: receipt.hash
            }
        })

    } catch (error: any) {
        safeLogger.error('❌ Error creating harvest NFT:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create harvest NFT'
            },
            { status: 500 }
        )
    }
}
