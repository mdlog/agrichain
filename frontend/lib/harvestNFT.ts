/**
 * Hedera Token Service (HTS) - Harvest NFT Creation
 * Creates NFT tokens on Hedera for harvest collateral
 */

import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    Hbar
} from "@hashgraph/sdk"
import { getHederaClient } from "./hederaClient"

export interface HarvestMetadata {
    cropType: string
    expectedYield: number      // in kg
    estimatedValue: number     // in HBAR (not wei)
    harvestDate: string        // ISO date string
    farmLocation: string
    farmSize: number           // in hectares
    farmerName: string
    farmerAddress: string
}

export interface HarvestNFTResult {
    tokenId: string
    serialNumber: string
    metadata: HarvestMetadata & {
        createdAt: string
        platform: string
        version: string
    }
    explorerUrl: string
}

/**
 * Create Harvest NFT on Hedera
 */
export async function createHarvestNFT(
    farmerAccountId: string,
    metadata: HarvestMetadata
): Promise<HarvestNFTResult> {

    const client = getHederaClient()

    console.log('🌾 Creating Harvest NFT on Hedera...')
    console.log('Farmer:', farmerAccountId)
    console.log('Crop:', metadata.cropType)
    console.log('Value:', metadata.estimatedValue, 'HBAR')

    // STEP 1: Create NFT Token
    console.log('Step 1: Creating NFT token...')

    const tokenName = `${metadata.cropType} Harvest`
    const tokenSymbol = metadata.cropType.substring(0, 4).toUpperCase()

    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1) // Only 1 NFT per harvest
        .setTreasuryAccountId(client.operatorAccountId!)
        .setSupplyKey(client.operatorPublicKey!)
        .setAdminKey(client.operatorPublicKey!)
        .setFreezeDefault(false)
        .setMaxTransactionFee(new Hbar(20))
        .execute(client)

    const tokenCreateRx = await tokenCreateTx.getReceipt(client)
    const tokenId = tokenCreateRx.tokenId

    if (!tokenId) {
        throw new Error('Failed to create NFT token')
    }

    console.log('✅ NFT Token Created:', tokenId.toString())

    // STEP 2: Mint NFT with Metadata
    console.log('Step 2: Minting NFT with metadata...')

    // Prepare metadata JSON
    const metadataJson = {
        ...metadata,
        createdAt: new Date().toISOString(),
        platform: "AgriChain Finance",
        version: "1.0",
        network: "Hedera Testnet"
    }

    const metadataBytes = Buffer.from(JSON.stringify(metadataJson))

    const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadataBytes])
        .setMaxTransactionFee(new Hbar(20))
        .execute(client)

    const mintRx = await mintTx.getReceipt(client)
    const serialNumber = mintRx.serials[0]

    console.log('✅ NFT Minted:', `${tokenId}/${serialNumber}`)

    // STEP 3: Return result
    const result: HarvestNFTResult = {
        tokenId: tokenId.toString(),
        serialNumber: serialNumber.toString(),
        metadata: metadataJson,
        explorerUrl: `https://hashscan.io/testnet/token/${tokenId}`
    }

    console.log('🎉 Harvest NFT Created Successfully!')
    console.log('Explorer:', result.explorerUrl)

    return result
}

/**
 * Get NFT metadata from Hedera
 * Note: This requires querying the mirror node
 */
export async function getNFTMetadata(
    tokenId: string,
    serialNumber: string
): Promise<any> {
    try {
        const url = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts/${serialNumber}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to fetch NFT metadata')
        }

        const data = await response.json()

        // Decode metadata
        if (data.metadata) {
            const metadataBuffer = Buffer.from(data.metadata, 'base64')
            const metadataJson = JSON.parse(metadataBuffer.toString())
            return metadataJson
        }

        return null
    } catch (error) {
        console.error('Error fetching NFT metadata:', error)
        return null
    }
}

/**
 * Verify NFT ownership
 */
export async function verifyNFTOwnership(
    tokenId: string,
    serialNumber: string,
    accountId: string
): Promise<boolean> {
    try {
        const url = `https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts/${serialNumber}`
        const response = await fetch(url)

        if (!response.ok) {
            return false
        }

        const data = await response.json()
        return data.account_id === accountId
    } catch (error) {
        console.error('Error verifying NFT ownership:', error)
        return false
    }
}
