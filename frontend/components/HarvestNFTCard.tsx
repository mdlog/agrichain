'use client'

import { ExternalLink, Calendar, MapPin, Wheat, TrendingUp } from 'lucide-react'

interface HarvestNFTCardProps {
    tokenId: string
    serialNumber: string
    metadata: {
        cropType: string
        expectedYield: number
        estimatedValue: number
        harvestDate: string
        farmLocation: string
        farmSize: number
        farmerName: string
        isActive: boolean
    }
    onCreateLoan?: () => void
}

export default function HarvestNFTCard({
    tokenId,
    serialNumber,
    metadata,
    onCreateLoan
}: HarvestNFTCardProps) {
    const hashscanUrl = `https://hashscan.io/testnet/token/${tokenId}`
    const harvestDate = new Date(metadata.harvestDate)

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wheat className="w-6 h-6 text-white" />
                        <h3 className="text-xl font-bold text-white">
                            {metadata.cropType} Harvest NFT
                        </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${metadata.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {metadata.isActive ? 'Active' : 'Locked'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Token Info */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Token ID:</span>
                        <span className="font-mono text-xs">{tokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Serial Number:</span>
                        <span className="font-mono">#{serialNumber}</span>
                    </div>
                </div>

                {/* Harvest Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Expected Yield</p>
                            <p className="font-semibold">{metadata.expectedYield.toLocaleString()} kg</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Estimated Value</p>
                            <p className="font-semibold">{metadata.estimatedValue.toLocaleString()} HBAR</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Harvest Date</p>
                            <p className="font-semibold">{harvestDate.toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Location</p>
                            <p className="font-semibold">{metadata.farmLocation}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Wheat className="w-5 h-5 text-amber-600" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Farm Size</p>
                            <p className="font-semibold">{metadata.farmSize} hectares</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <a
                        href={hashscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View on HashScan
                    </a>

                    {metadata.isActive && onCreateLoan && (
                        <button
                            onClick={onCreateLoan}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            Request Loan
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
