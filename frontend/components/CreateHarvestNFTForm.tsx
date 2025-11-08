'use client'

import { useState } from 'react'
import { Loader2, Wheat, Calendar, MapPin, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCSRFToken } from '@/lib/csrfClient'

interface CreateHarvestNFTFormProps {
    farmerAddress: string
    farmerName: string
    onSuccess?: (nft: any) => void
}

export default function CreateHarvestNFTForm({
    farmerAddress,
    farmerName,
    onSuccess
}: CreateHarvestNFTFormProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({
        cropType: '',
        expectedYield: '',
        estimatedValue: '',
        harvestDate: '',
        farmLocation: '',
        farmSize: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.cropType || !formData.expectedYield || !formData.estimatedValue ||
            !formData.harvestDate || !formData.farmLocation || !formData.farmSize) {
            toast.error('Please fill all fields')
            return
        }

        // Check harvest date is in future
        const harvestDate = new Date(formData.harvestDate)
        if (harvestDate <= new Date()) {
            toast.error('Harvest date must be in the future')
            return
        }

        setIsCreating(true)
        const loadingToast = toast.loading('Creating Harvest NFT on Hedera...')

        try {
            // Get CSRF token (will fetch from API if not in cookie)
            const csrfToken = await getCSRFToken()

            console.log('🔐 CSRF Debug:')
            console.log('  All cookies:', document.cookie)
            console.log('  CSRF token:', csrfToken)
            console.log('  Token length:', csrfToken.length)

            const response = await fetch('/api/harvest-nft/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken
                },
                body: JSON.stringify({
                    farmerAddress,
                    farmerName,
                    cropType: formData.cropType,
                    expectedYield: parseInt(formData.expectedYield),
                    estimatedValue: parseInt(formData.estimatedValue),
                    harvestDate: formData.harvestDate,
                    farmLocation: formData.farmLocation,
                    farmSize: parseInt(formData.farmSize)
                })
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Harvest NFT created successfully!', { id: loadingToast })
                toast.success(`Token ID: ${result.data.tokenId}`)

                // Save to localStorage with internal ID
                const nftData = {
                    tokenId: result.data.tokenId,
                    serialNumber: result.data.serialNumber,
                    internalId: result.data.internalId, // Internal ID from smart contract
                    metadata: {
                        cropType: formData.cropType,
                        expectedYield: parseInt(formData.expectedYield),
                        estimatedValue: parseInt(formData.estimatedValue),
                        harvestDate: formData.harvestDate,
                        farmLocation: formData.farmLocation,
                        farmSize: parseInt(formData.farmSize),
                        farmerName: farmerName,
                        farmerAddress: farmerAddress,
                        isActive: true
                    },
                    createdAt: new Date().toISOString()
                }

                // Save to localStorage
                const storedNFTs = localStorage.getItem(`nfts_${farmerAddress}`)
                const nfts = storedNFTs ? JSON.parse(storedNFTs) : []
                nfts.unshift(nftData)
                localStorage.setItem(`nfts_${farmerAddress}`, JSON.stringify(nfts))

                // Reset form
                setFormData({
                    cropType: '',
                    expectedYield: '',
                    estimatedValue: '',
                    harvestDate: '',
                    farmLocation: '',
                    farmSize: ''
                })

                // Call success callback
                if (onSuccess) {
                    onSuccess(nftData)
                }
            } else {
                toast.error(result.error || 'Failed to create NFT', { id: loadingToast })
            }
        } catch (error: any) {
            console.error('Error creating NFT:', error)
            toast.error('Failed to create NFT', { id: loadingToast })
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
                <Wheat className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold">Create Harvest NFT</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Crop Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Type *
                    </label>
                    <select
                        value={formData.cropType}
                        onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        disabled={isCreating}
                        required
                    >
                        <option value="">Select crop type...</option>

                        {/* Cereals / Grains */}
                        <optgroup label="🌾 Cereals & Grains">
                            <option value="Rice">Rice (Padi)</option>
                            <option value="Wheat">Wheat (Gandum)</option>
                            <option value="Corn">Corn (Jagung)</option>
                            <option value="Barley">Barley (Jelai)</option>
                            <option value="Oats">Oats (Oat)</option>
                            <option value="Sorghum">Sorghum (Sorgum)</option>
                            <option value="Millet">Millet (Milet)</option>
                        </optgroup>

                        {/* Legumes */}
                        <optgroup label="🫘 Legumes">
                            <option value="Soybean">Soybean (Kedelai)</option>
                            <option value="Peanut">Peanut (Kacang Tanah)</option>
                            <option value="Green Bean">Green Bean (Kacang Hijau)</option>
                            <option value="Red Bean">Red Bean (Kacang Merah)</option>
                            <option value="Chickpea">Chickpea (Kacang Arab)</option>
                            <option value="Lentil">Lentil (Lentil)</option>
                        </optgroup>

                        {/* Vegetables */}
                        <optgroup label="🥬 Vegetables">
                            <option value="Tomato">Tomato (Tomat)</option>
                            <option value="Potato">Potato (Kentang)</option>
                            <option value="Onion">Onion (Bawang Merah)</option>
                            <option value="Garlic">Garlic (Bawang Putih)</option>
                            <option value="Cabbage">Cabbage (Kubis)</option>
                            <option value="Carrot">Carrot (Wortel)</option>
                            <option value="Chili">Chili (Cabai)</option>
                            <option value="Eggplant">Eggplant (Terong)</option>
                            <option value="Cucumber">Cucumber (Timun)</option>
                            <option value="Lettuce">Lettuce (Selada)</option>
                        </optgroup>

                        {/* Fruits */}
                        <optgroup label="🍎 Fruits">
                            <option value="Banana">Banana (Pisang)</option>
                            <option value="Mango">Mango (Mangga)</option>
                            <option value="Papaya">Papaya (Pepaya)</option>
                            <option value="Pineapple">Pineapple (Nanas)</option>
                            <option value="Watermelon">Watermelon (Semangka)</option>
                            <option value="Melon">Melon (Melon)</option>
                            <option value="Orange">Orange (Jeruk)</option>
                            <option value="Apple">Apple (Apel)</option>
                            <option value="Strawberry">Strawberry (Stroberi)</option>
                            <option value="Durian">Durian (Durian)</option>
                        </optgroup>

                        {/* Cash Crops */}
                        <optgroup label="☕ Cash Crops">
                            <option value="Coffee">Coffee (Kopi)</option>
                            <option value="Cocoa">Cocoa (Kakao)</option>
                            <option value="Tea">Tea (Teh)</option>
                            <option value="Rubber">Rubber (Karet)</option>
                            <option value="Palm Oil">Palm Oil (Kelapa Sawit)</option>
                            <option value="Sugarcane">Sugarcane (Tebu)</option>
                            <option value="Cotton">Cotton (Kapas)</option>
                            <option value="Tobacco">Tobacco (Tembakau)</option>
                        </optgroup>

                        {/* Spices & Herbs */}
                        <optgroup label="🌿 Spices & Herbs">
                            <option value="Black Pepper">Black Pepper (Lada Hitam)</option>
                            <option value="Ginger">Ginger (Jahe)</option>
                            <option value="Turmeric">Turmeric (Kunyit)</option>
                            <option value="Galangal">Galangal (Lengkuas)</option>
                            <option value="Lemongrass">Lemongrass (Serai)</option>
                            <option value="Vanilla">Vanilla (Vanili)</option>
                            <option value="Cinnamon">Cinnamon (Kayu Manis)</option>
                            <option value="Clove">Clove (Cengkeh)</option>
                            <option value="Nutmeg">Nutmeg (Pala)</option>
                        </optgroup>

                        {/* Root Crops */}
                        <optgroup label="🥔 Root Crops">
                            <option value="Cassava">Cassava (Singkong)</option>
                            <option value="Sweet Potato">Sweet Potato (Ubi Jalar)</option>
                            <option value="Taro">Taro (Talas)</option>
                            <option value="Yam">Yam (Ubi)</option>
                        </optgroup>

                        {/* Other */}
                        <optgroup label="🌱 Other">
                            <option value="Mushroom">Mushroom (Jamur)</option>
                            <option value="Bamboo">Bamboo (Bambu)</option>
                            <option value="Other">Other (Lainnya)</option>
                        </optgroup>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the type of crop you're growing</p>
                </div>

                {/* Expected Yield */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Yield (kg) *
                    </label>
                    <input
                        type="number"
                        value={formData.expectedYield}
                        onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                        placeholder="e.g., 10000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreating}
                    />
                </div>

                {/* Estimated Value */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Value (HBAR) *
                    </label>
                    <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                        placeholder="e.g., 5000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreating}
                    />
                </div>

                {/* Harvest Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Harvest Date *
                    </label>
                    <input
                        type="date"
                        value={formData.harvestDate}
                        onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreating}
                    />
                </div>

                {/* Farm Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Location *
                    </label>
                    <input
                        type="text"
                        value={formData.farmLocation}
                        onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                        placeholder="e.g., Makassar, Indonesia"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreating}
                    />
                </div>

                {/* Farm Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size (hectares) *
                    </label>
                    <input
                        type="number"
                        value={formData.farmSize}
                        onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                        placeholder="e.g., 12"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isCreating}
                    />
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Creating a Harvest NFT will mint a native NFT on Hedera blockchain.
                    This NFT can be used as collateral for loans and is verifiable on HashScan.
                </p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isCreating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating NFT on Hedera...
                    </>
                ) : (
                    <>
                        <Wheat className="w-5 h-5" />
                        Create Harvest NFT
                    </>
                )}
            </button>

            {/* Cost Info */}
            <p className="text-xs text-gray-500 text-center">
                Cost: ~0.05 HBAR (~$0.005) per NFT
            </p>
        </form>
    )
}
