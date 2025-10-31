/**
 * Simple NFT Database using JSON file storage
 * For production, replace with PostgreSQL/MongoDB
 */

import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'nfts.json')

export interface NFTRecord {
    id: string // tokenId-serialNumber
    tokenId: string
    serialNumber: string
    internalId: number | null
    farmerAddress: string
    farmerName: string
    metadata: {
        cropType: string
        expectedYield: number
        estimatedValue: number
        harvestDate: string
        farmLocation: string
        farmSize: number
        isActive: boolean
    }
    createdAt: string
    explorerUrl: string
    contractTx?: string
}

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ nfts: [] }, null, 2))
    }
}

// Read all NFTs
function readNFTs(): NFTRecord[] {
    ensureDataDir()
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8')
        const parsed = JSON.parse(data)
        return parsed.nfts || []
    } catch (error) {
        console.error('Error reading NFT database:', error)
        return []
    }
}

// Write NFTs
function writeNFTs(nfts: NFTRecord[]) {
    ensureDataDir()
    fs.writeFileSync(DB_PATH, JSON.stringify({ nfts }, null, 2))
}

// Save NFT
export function saveNFT(nft: NFTRecord): void {
    const nfts = readNFTs()

    // Check if already exists
    const existingIndex = nfts.findIndex(n => n.id === nft.id)

    if (existingIndex >= 0) {
        // Update existing
        nfts[existingIndex] = nft
    } else {
        // Add new
        nfts.unshift(nft)
    }

    writeNFTs(nfts)
}

// Get NFT by ID
export function getNFTById(id: string): NFTRecord | null {
    const nfts = readNFTs()
    return nfts.find(n => n.id === id) || null
}

// Get NFTs by farmer address
export function getNFTsByFarmer(farmerAddress: string): NFTRecord[] {
    const nfts = readNFTs()
    return nfts.filter(n =>
        n.farmerAddress.toLowerCase() === farmerAddress.toLowerCase()
    )
}

// Get all NFTs (with pagination)
export function getAllNFTs(limit?: number, offset?: number): NFTRecord[] {
    const nfts = readNFTs()

    if (limit !== undefined && offset !== undefined) {
        return nfts.slice(offset, offset + limit)
    }

    return nfts
}

// Update NFT status
export function updateNFTStatus(id: string, isActive: boolean): boolean {
    const nfts = readNFTs()
    const nftIndex = nfts.findIndex(n => n.id === id)

    if (nftIndex >= 0) {
        nfts[nftIndex].metadata.isActive = isActive
        writeNFTs(nfts)
        return true
    }

    return false
}

// Get NFT count
export function getNFTCount(): number {
    const nfts = readNFTs()
    return nfts.length
}

// Get NFT count by farmer
export function getNFTCountByFarmer(farmerAddress: string): number {
    const nfts = readNFTs()
    return nfts.filter(n =>
        n.farmerAddress.toLowerCase() === farmerAddress.toLowerCase()
    ).length
}
