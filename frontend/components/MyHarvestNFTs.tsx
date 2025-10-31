'use client'

import { useState, useEffect } from 'react'
import { Loader2, Wheat } from 'lucide-react'
import HarvestNFTCard from './HarvestNFTCard'
import toast from 'react-hot-toast'

interface MyHarvestNFTsProps {
    farmerAddress: string
    onCreateLoan?: (nftData: any) => void
}

export default function MyHarvestNFTs({ farmerAddress, onCreateLoan }: MyHarvestNFTsProps) {
    const [nfts, setNfts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadNFTs()
    }, [farmerAddress])

    const loadNFTs = async () => {
        setIsLoading(true)
        try {
            // TODO: Implement API to fetch farmer's NFTs from contract
            // For now, we'll use localStorage as a temporary solution
            const storedNFTs = localStorage.getItem(`nfts_${farmerAddress}`)
            if (storedNFTs) {
                setNfts(JSON.parse(storedNFTs))
            }
        } catch (error) {
            console.error('Error loading NFTs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateLoan = (nft: any) => {
        if (onCreateLoan) {
            onCreateLoan(nft)
        } else {
            toast.success('Redirecting to loan creation...')
            // TODO: Navigate to loan creation with NFT data
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (nfts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Wheat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Harvest NFTs Yet
                </h3>
                <p className="text-gray-500 mb-6">
                    Create your first Harvest NFT to use as collateral for loans
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">My Harvest NFTs ({nfts.length})</h3>
                <button
                    onClick={loadNFTs}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft, index) => (
                    <HarvestNFTCard
                        key={index}
                        tokenId={nft.tokenId}
                        serialNumber={nft.serialNumber}
                        metadata={nft.metadata}
                        onCreateLoan={() => handleCreateLoan(nft)}
                    />
                ))}
            </div>
        </div>
    )
}
