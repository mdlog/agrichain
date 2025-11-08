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

    // Debug: Check if onCreateLoan prop exists
    useEffect(() => {
        console.log('🟢 MyHarvestNFTs mounted')
        console.log('🟢 onCreateLoan prop:', onCreateLoan)
        console.log('🟢 onCreateLoan type:', typeof onCreateLoan)
        console.log('🟢 onCreateLoan exists:', !!onCreateLoan)
    }, [])

    useEffect(() => {
        loadNFTs()
    }, [farmerAddress])

    const loadNFTs = async () => {
        setIsLoading(true)
        try {
            // Fetch from online database
            const response = await fetch(`/api/nfts?farmer=${farmerAddress}`)
            const result = await response.json()

            if (result.success && result.data) {
                setNfts(result.data)

                // Also sync to localStorage for offline access
                localStorage.setItem(`nfts_${farmerAddress}`, JSON.stringify(result.data))
            } else {
                // Fallback to localStorage if API fails
                const storedNFTs = localStorage.getItem(`nfts_${farmerAddress}`)
                if (storedNFTs) {
                    setNfts(JSON.parse(storedNFTs))
                }
            }
        } catch (error) {
            console.error('Error loading NFTs:', error)

            // Fallback to localStorage on error
            const storedNFTs = localStorage.getItem(`nfts_${farmerAddress}`)
            if (storedNFTs) {
                setNfts(JSON.parse(storedNFTs))
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateLoan = (nft: any) => {
        console.log('🔵 MyHarvestNFTs - handleCreateLoan called with NFT:', nft)
        if (onCreateLoan) {
            console.log('🔵 MyHarvestNFTs - Calling parent onCreateLoan callback')
            try {
                const result = onCreateLoan(nft)
                console.log('🔵 MyHarvestNFTs - Callback returned:', result)
            } catch (error) {
                console.error('❌ MyHarvestNFTs - Error calling onCreateLoan:', error)
            }
        } else {
            console.warn('⚠️ MyHarvestNFTs - No onCreateLoan callback provided')
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

            <div className="space-y-6">
                {nfts.map((nft, index) => (
                    <HarvestNFTCard
                        key={nft.id || `${nft.tokenId}-${nft.serialNumber}`}
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
