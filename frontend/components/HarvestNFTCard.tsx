'use client'

import { ExternalLink, Calendar, MapPin, Wheat, TrendingUp, DollarSign, Sparkles } from 'lucide-react'

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
    const maxLoanAmount = Math.floor(metadata.estimatedValue * 0.7)

    // Calculate days until harvest
    const today = new Date()
    const daysUntilHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 min-w-0">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>

                <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                                <Wheat className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-0.5">
                                    {metadata.cropType}
                                </h3>
                                <p className="text-white/80 text-xs">Harvest NFT</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${metadata.isActive
                            ? 'bg-white text-green-600'
                            : 'bg-red-500 text-white'
                            }`}>
                            {metadata.isActive ? '✓ Active' : '🔒 Locked'}
                        </span>
                    </div>

                    {/* Token Info Badges */}
                    <div className="flex gap-2 flex-wrap">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-mono">
                            ID: {tokenId.split('.').pop()}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-mono">
                            Serial #{serialNumber}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content - Horizontal Layout */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Key Metrics */}
                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3.5 border border-blue-200">
                            <div className="flex items-center gap-2 mb-1.5">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <p className="text-xs font-medium text-blue-600">Estimated Value</p>
                            </div>
                            <p className="text-xl font-bold text-blue-900">
                                {metadata.estimatedValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">HBAR</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3.5 border border-green-200">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles className="w-4 h-4 text-green-600" />
                                <p className="text-xs font-medium text-green-600">Max Loan</p>
                            </div>
                            <p className="text-xl font-bold text-green-900">
                                {maxLoanAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">HBAR (70%)</p>
                        </div>
                    </div>

                    {/* Middle: Harvest Details */}
                    <div className="bg-gray-50 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-purple-100 p-1.5 rounded-lg">
                                <Calendar className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Harvest Date</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${daysUntilHarvest > 30
                                ? 'bg-green-100 text-green-700'
                                : daysUntilHarvest > 0
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {daysUntilHarvest > 0 ? `${daysUntilHarvest}d` : 'Late'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="bg-amber-100 p-1.5 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Expected Yield</p>
                                <p className="text-sm font-semibold text-gray-900">{metadata.expectedYield.toLocaleString()} kg</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="bg-red-100 p-1.5 rounded-lg">
                                <MapPin className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{metadata.farmLocation}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="bg-green-100 p-1.5 rounded-lg">
                                <Wheat className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Farm Size</p>
                                <p className="text-sm font-semibold text-gray-900">{metadata.farmSize} ha</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="space-y-2.5">
                        <a
                            href={hashscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl w-full text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>HashScan</span>
                        </a>

                        {metadata.isActive && onCreateLoan && (
                            <button
                                onClick={onCreateLoan}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm"
                            >
                                Request Loan
                            </button>
                        )}

                        {metadata.isActive && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                                <p className="text-xs text-green-800 text-center leading-relaxed">
                                    💡 Max loan: <span className="font-semibold">{maxLoanAmount.toLocaleString()} HBAR</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
