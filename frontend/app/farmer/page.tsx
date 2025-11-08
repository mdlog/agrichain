'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Sprout, Plus, List, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle2, Clock, Shield, Lock, ExternalLink, Wheat, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getVerificationLevel } from '@/lib/verificationLevels'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import { hbarToWei, debugHBARTransaction, validateHBARAmount } from '@/lib/hbarUtils'
import CreateHarvestNFTForm from '@/components/CreateHarvestNFTForm'
import MyHarvestNFTs from '@/components/MyHarvestNFTs'


interface CreatedLoan {
    id: number
    cropType: string
    expectedYield: string
    estimatedValue: string
    harvestDate: string
    loanAmount: string
    interestRate: string
    duration: string
    createdAt: Date
    status: string
    txHash?: string // Transaction hash from blockchain
    isOnChain?: boolean // Flag to identify blockchain loans
}

export default function FarmerDashboard() {
    const { account, connectWallet, signer, provider } = useWallet()
    const [activeTab, setActiveTab] = useState<'nft' | 'create' | 'loans'>('nft')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [blockchainLoans, setBlockchainLoans] = useState<any[]>([])
    const [selectedNFTForLoan, setSelectedNFTForLoan] = useState<any>(null)

    // Stats from blockchain
    const [totalRequested, setTotalRequested] = useState<string>('0')
    const [totalFunded, setTotalFunded] = useState<string>('0')
    const [activeLoansCount, setActiveLoansCount] = useState<number>(0)
    const [completedLoansCount, setCompletedLoansCount] = useState<number>(0)

    // Load created loans from localStorage (only on-chain loans)
    const [farmerLoans, setFarmerLoans] = useState<CreatedLoan[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('farmerCreatedLoans')
            if (saved) {
                const allLoans = JSON.parse(saved)
                // Filter only on-chain loans
                const onChainLoans = allLoans.filter((loan: CreatedLoan) => loan.isOnChain && loan.txHash)

                // Remove duplicates based on loan ID
                const uniqueLoans = onChainLoans.reduce((acc: CreatedLoan[], current: CreatedLoan) => {
                    const exists = acc.find(loan => loan.id === current.id)
                    if (!exists) {
                        acc.push(current)
                    }
                    return acc
                }, [])

                // Save back filtered and deduplicated loans
                localStorage.setItem('farmerCreatedLoans', JSON.stringify(uniqueLoans))
                return uniqueLoans
            }
        }
        return []
    })

    // Function to add new loan
    const addLoanToHistory = async (loanData: Omit<CreatedLoan, 'id' | 'createdAt'>, nftInternalId?: number) => {
        if (!signer) {
            toast.error('Please connect your wallet first')
            return
        }

        setIsSubmitting(true)

        try {
            const contract = getContract(signer)
            const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

            if (!CONTRACT_ADDRESS) {
                throw new Error('Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local')
            }

            let harvestTokenId: any

            // Validate loan amount
            const loanAmountValidation = validateHBARAmount(loanData.loanAmount, 1, 1000000)
            if (loanAmountValidation) {
                throw new Error(`Invalid loan amount: ${loanAmountValidation}`)
            }

            // Check if using NFT or creating new token
            if (nftInternalId) {
                // ✅ NEW: Use existing NFT as collateral
                console.log('Using NFT Internal ID:', nftInternalId)
                console.log('🔍 HarvestTokenNFT Contract:', process.env.NEXT_PUBLIC_HARVEST_NFT_CONTRACT)
                console.log('🔍 AgriChain Contract:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)

                // Validate NFT exists and is active before submitting
                // Note: Validation is optional due to Hedera view function gas issues
                const loadingToast0 = toast.loading('Validating NFT...')
                try {
                    // Try to get NFT data from HarvestTokenNFT contract
                    const harvestNFTContract = new ethers.Contract(
                        process.env.NEXT_PUBLIC_HARVEST_NFT_CONTRACT || '',
                        [
                            'function getHarvestNFT(uint256) view returns (tuple(string cropType, uint256 expectedYield, uint256 estimatedValue, uint256 harvestDate, string farmLocation, uint256 farmSize, address farmer, uint256 createdAt, bool isActive))',
                            'function isNFTOwner(uint256, address) view returns (bool)'
                        ],
                        signer
                    )

                    const nftData = await harvestNFTContract.getHarvestNFT(nftInternalId)
                    console.log('✅ NFT Data retrieved:', {
                        cropType: nftData.cropType,
                        farmer: nftData.farmer,
                        isActive: nftData.isActive
                    })

                    if (!nftData.isActive) {
                        toast.dismiss(loadingToast0)
                        throw new Error('This NFT is already being used as collateral for another loan. Please select a different NFT or create a new one.')
                    }

                    if (nftData.farmer.toLowerCase() !== account?.toLowerCase()) {
                        toast.dismiss(loadingToast0)
                        throw new Error('You are not the owner of this NFT.')
                    }

                    toast.dismiss(loadingToast0)
                    toast.success('NFT validated!')
                } catch (error: any) {
                    toast.dismiss(loadingToast0)
                    console.error('❌ NFT Validation Error:', error)

                    // If it's a critical error (ownership/active status), throw it
                    if (error.message.includes('already being used') || error.message.includes('not the owner')) {
                        throw error
                    }

                    // For other errors (like INSUFFICIENT_PAYER_BALANCE), just warn and continue
                    console.warn('⚠️ Skipping validation due to error. Will validate during transaction.')
                    toast.success('Proceeding with loan request...')
                }

                const loadingToast1 = toast.loading('Step 1/2: Converting NFT to harvest token...')

                console.log('🔄 Calling createHarvestTokenFromNFT with ID:', nftInternalId)
                const createTokenTx = await contract.createHarvestTokenFromNFT(nftInternalId)
                console.log('📝 Transaction sent:', createTokenTx.hash)

                const createTokenReceipt = await createTokenTx.wait()
                console.log('✅ Transaction confirmed:', createTokenReceipt.hash)

                toast.dismiss(loadingToast1)
                toast.success('NFT converted to harvest token!')

                // Extract token ID from event
                const tokenCreatedEvent = createTokenReceipt.logs.find((log: any) => {
                    try {
                        const parsed = contract.interface.parseLog(log)
                        return parsed && parsed.name === 'HarvestTokenCreated'
                    } catch {
                        return false
                    }
                })

                if (!tokenCreatedEvent) {
                    throw new Error('Failed to get harvest token ID from event')
                }

                const parsedEvent = contract.interface.parseLog(tokenCreatedEvent)
                if (!parsedEvent) {
                    throw new Error('Failed to parse harvest token event')
                }

                harvestTokenId = parsedEvent.args[0]

            } else {
                // ❌ OLD: Create new harvest token (legacy method)
                const mockTokenAddress = '0x0000000000000000000000000000000000000001'
                const harvestDate = Math.floor(new Date(loanData.harvestDate).getTime() / 1000)

                const loadingToast1 = toast.loading('Step 1/2: Creating harvest token on blockchain...')

                // Validate amounts before sending
                const estimatedValueValidation = validateHBARAmount(loanData.estimatedValue, 1, 10000000)
                if (estimatedValueValidation) {
                    throw new Error(`Invalid estimated value: ${estimatedValueValidation}`)
                }

                // Convert HBAR to wei using utility function
                const estimatedValueWei = hbarToWei(loanData.estimatedValue)
                debugHBARTransaction('Estimated Value', loanData.estimatedValue, estimatedValueWei)

                const createTokenTx = await contract.createHarvestToken(
                    mockTokenAddress, // token address
                    loanData.cropType, // crop type
                    ethers.parseUnits(loanData.expectedYield, 0), // expected yield in kg
                    estimatedValueWei, // estimated value in HBAR wei (18 decimals)
                    harvestDate // harvest date timestamp
                )

                const createTokenReceipt = await createTokenTx.wait()

                toast.dismiss(loadingToast1)
                toast.success('Harvest token created!')

                // Extract token ID from event
                const tokenCreatedEvent = createTokenReceipt.logs.find((log: any) => {
                    try {
                        const parsed = contract.interface.parseLog(log)
                        return parsed && parsed.name === 'HarvestTokenCreated'
                    } catch {
                        return false
                    }
                })

                if (!tokenCreatedEvent) {
                    throw new Error('Failed to get harvest token ID from event')
                }

                const parsedEvent = contract.interface.parseLog(tokenCreatedEvent)
                if (!parsedEvent) {
                    throw new Error('Failed to parse harvest token event')
                }

                harvestTokenId = parsedEvent.args[0]
            }

            // Step 2: Request loan
            const loadingToast2 = toast.loading('Step 2/2: Requesting loan on blockchain...')

            // Convert loan amount to wei using utility function
            const loanAmountWei = hbarToWei(loanData.loanAmount)
            debugHBARTransaction('Loan Amount', loanData.loanAmount, loanAmountWei)

            // Convert interest rate from percentage to basis points (5% = 500 basis points)
            const interestRateBasisPoints = Math.floor(parseFloat(loanData.interestRate) * 100)

            const requestLoanTx = await contract.requestLoan(
                harvestTokenId, // harvest token ID from step 1
                loanAmountWei, // loan amount in HBAR wei (18 decimals)
                interestRateBasisPoints, // interest rate in basis points (e.g., 500 = 5%)
                ethers.parseUnits(loanData.duration, 0) // duration in days
            )

            const requestLoanReceipt = await requestLoanTx.wait()

            // Dismiss loading toast
            toast.dismiss(loadingToast2)
            toast.success('Loan request submitted!')

            // Extract loan ID from event
            const loanRequestedEvent = requestLoanReceipt.logs.find((log: any) => {
                try {
                    const parsed = contract.interface.parseLog(log)
                    return parsed && parsed.name === 'LoanRequested'
                } catch {
                    return false
                }
            })

            if (!loanRequestedEvent) {
                throw new Error('Failed to get loan ID from event')
            }

            const parsedLoanEvent = contract.interface.parseLog(loanRequestedEvent)
            if (!parsedLoanEvent) {
                throw new Error('Failed to parse loan event')
            }

            const loanId = parsedLoanEvent.args[0].toString()

            toast.success(`Loan request created on blockchain! Loan ID: ${loanId}`, {
                duration: 5000
            })

            // Save to local state for display
            const newLoan: CreatedLoan = {
                ...loanData,
                id: parseInt(loanId),
                createdAt: new Date(),
                status: 'Pending',
                txHash: requestLoanReceipt.hash, // Store transaction hash
                isOnChain: true // Mark as on-chain loan
            }

            // Add to state
            setFarmerLoans(prev => [newLoan, ...prev])

            // Save to localStorage
            if (typeof window !== 'undefined') {
                // Save to farmer history
                const saved = localStorage.getItem('farmerCreatedLoans') || '[]'
                const loans = JSON.parse(saved)
                loans.unshift(newLoan)
                localStorage.setItem('farmerCreatedLoans', JSON.stringify(loans))

                // Also add to marketplace
                const marketplaceLoans = JSON.parse(localStorage.getItem('marketplaceLoans') || '[]')
                const marketplaceLoan = {
                    id: newLoan.id,
                    farmer: account || '0x0000000000000000000000000000000000000000',
                    farmerName: 'You',
                    cropType: newLoan.cropType,
                    requestedAmount: newLoan.loanAmount,
                    interestRate: Math.floor(parseFloat(newLoan.interestRate) * 100), // Convert to basis points (5% = 500)
                    duration: parseInt(newLoan.duration),
                    fundedAmount: '0',
                    status: 0,
                    createdAt: Math.floor(newLoan.createdAt.getTime() / 1000),
                    harvestDate: Math.floor(new Date(newLoan.harvestDate).getTime() / 1000),
                    expectedYield: parseInt(newLoan.expectedYield),
                    collateralValue: newLoan.estimatedValue
                }

                marketplaceLoans.unshift(marketplaceLoan)
                localStorage.setItem('marketplaceLoans', JSON.stringify(marketplaceLoans))

                // Trigger event for real-time update
                window.dispatchEvent(new Event('loanCreated'))

                // Auto switch to My Loans tab after 1.5 seconds
                setTimeout(() => {
                    setActiveTab('loans')
                }, 1500)
            }

        } catch (error: any) {
            console.error('Error creating loan:', error)

            // Show user-friendly error message
            let errorMessage = 'Failed to create loan on blockchain'

            if (error.message?.includes('revert')) {
                errorMessage = error.message.split('revert ')[1] || errorMessage
            } else if (error.message) {
                errorMessage = error.message
            }

            toast.error(errorMessage)
            toast.error('Please try again or check your wallet connection')

        } finally {
            setIsSubmitting(false)
        }
    }

    if (!account) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="card max-w-lg text-center">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sprout className="w-10 h-10 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Farmer Dashboard</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Connect your wallet to access farmer features and start requesting loans for your agricultural needs.
                    </p>
                    <button onClick={connectWallet} className="btn-primary w-full text-lg py-3">
                        Connect Wallet
                    </button>
                    <div className="mt-8 pt-8 border-t">
                        <p className="text-sm text-gray-500 mb-4">Why connect your wallet?</p>
                        <div className="grid grid-cols-1 gap-3 text-left">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">Tokenize your future harvest as collateral</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">Request loans with competitive interest rates</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">Track your loans and repayments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Sprout className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">Farmer Dashboard</h1>
                                <p className="text-gray-600">Manage your harvest tokens and loan requests</p>
                            </div>
                        </div>
                        <Link href="/farmer/verification" className="btn-secondary flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            <span className="hidden sm:inline">Get Verified</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<DollarSign className="w-6 h-6" />}
                        label="Total Requested"
                        value={`${totalRequested} HBAR`}
                        color="blue"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Total Funded"
                        value={`${totalFunded} HBAR`}
                        color="green"
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        label="Active Loans"
                        value={activeLoansCount.toString()}
                        color="yellow"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        label="Completed"
                        value={completedLoansCount.toString()}
                        color="purple"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-8">
                    <button
                        onClick={() => setActiveTab('nft')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'nft'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <Wheat className="w-5 h-5" />
                        Create Harvest NFT
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'create'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        Request Loan
                    </button>
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'loans'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <List className="w-5 h-5" />
                        My Loans
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'nft' ? (
                    <div className="space-y-6">
                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <Wheat className="w-5 h-5" />
                                🎉 Harvest NFTs - Use as Collateral
                            </h3>
                            <p className="text-blue-800 mb-4">
                                Create real NFTs on Hedera blockchain to represent your future harvest.
                                Use them as collateral for loans - they're reusable, verifiable on HashScan,
                                and cost only ~0.05 HBAR (~$0.005) to create!
                            </p>
                            <div className="bg-blue-100 rounded-lg p-4 mt-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">📌 NFT Custody Model</p>
                                <p className="text-sm text-blue-800">
                                    NFTs are held by the platform treasury and linked to your wallet address.
                                    This ensures seamless integration with loans without requiring token association in your wallet.
                                </p>
                            </div>
                        </div>

                        {/* Grid 2 Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Create Form */}
                            <div>
                                <CreateHarvestNFTForm
                                    farmerAddress={account || ''}
                                    farmerName="Farmer"
                                    onSuccess={(nft) => {
                                        toast.success('NFT created! You can now use it as collateral for loans.')
                                    }}
                                />
                            </div>

                            {/* Right Column - My NFTs */}
                            <div>
                                <MyHarvestNFTs
                                    farmerAddress={account || ''}
                                    onCreateLoan={(nft) => {
                                        console.log('🔴 Farmer Page - onCreateLoan called with NFT:', nft)
                                        setSelectedNFTForLoan(nft)
                                        setActiveTab('create')
                                        toast.success(`NFT selected! Fill in loan details.`)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'create' ? (
                    <CreateLoanForm
                        key={selectedNFTForLoan?.id || 'default'}
                        onSuccess={addLoanToHistory}
                        isSubmitting={isSubmitting}
                        provider={provider}
                        account={account}
                        selectedNFT={selectedNFTForLoan}
                        onClearNFT={() => setSelectedNFTForLoan(null)}
                    />
                ) : (
                    <MyLoans loans={farmerLoans} provider={provider} account={account} blockchainLoans={blockchainLoans} setBlockchainLoans={setBlockchainLoans} setTotalRequested={setTotalRequested} setTotalFunded={setTotalFunded} setActiveLoansCount={setActiveLoansCount} setCompletedLoansCount={setCompletedLoansCount} />
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode
    label: string
    value: string
    color: string
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600'
    }

    return (
        <div className="card">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
                {icon}
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    )
}

function CreateLoanForm({ onSuccess, isSubmitting, provider, account, selectedNFT, onClearNFT }: {
    onSuccess: (loanData: Omit<CreatedLoan, 'id' | 'createdAt'>, nftInternalId?: number) => Promise<void>
    isSubmitting: boolean
    provider: any
    account: string | null
    selectedNFT?: any
    onClearNFT?: () => void
}) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        cropType: '',
        expectedYield: '',
        estimatedValue: '',
        harvestDate: '',
        loanAmount: '',
        interestRate: '5',
        duration: '90'
    })
    const [availableNFTs, setAvailableNFTs] = useState<any[]>([])
    const [selectedNFTId, setSelectedNFTId] = useState<string>('')
    const [useNFT, setUseNFT] = useState(false)

    // Load available NFTs when component mounts
    useEffect(() => {
        if (account) {
            loadAvailableNFTs()
        }
    }, [account])

    // Auto-fill form when NFT is selected from NFT tab
    useEffect(() => {
        console.log('🔍 CreateLoanForm mounted/updated, selectedNFT:', selectedNFT)
        if (selectedNFT) {
            console.log('✅ Auto-filling form with NFT data:', selectedNFT)
            console.log('  - cropType:', selectedNFT.metadata?.cropType)
            console.log('  - expectedYield:', selectedNFT.metadata?.expectedYield)
            console.log('  - estimatedValue:', selectedNFT.metadata?.estimatedValue)
            console.log('  - harvestDate:', selectedNFT.metadata?.harvestDate)
            console.log('  - internalId:', selectedNFT.internalId)

            setUseNFT(true)
            setSelectedNFTId(selectedNFT.internalId?.toString() || '')
            setFormData({
                cropType: selectedNFT.metadata.cropType || '',
                expectedYield: selectedNFT.metadata.expectedYield?.toString() || '',
                estimatedValue: selectedNFT.metadata.estimatedValue?.toString() || '',
                harvestDate: selectedNFT.metadata.harvestDate || '',
                loanAmount: '',
                interestRate: '5',
                duration: '90'
            })
            setStep(2) // Skip to loan details
            toast.success(`Using NFT: ${selectedNFT.metadata.cropType} Harvest`)
        } else {
            console.log('⚠️ selectedNFT is null/undefined')
        }
    }, [selectedNFT])

    const loadAvailableNFTs = async () => {
        try {
            // Load from localStorage (temporary solution)
            const storedNFTs = localStorage.getItem(`nfts_${account}`)
            if (storedNFTs) {
                const nfts = JSON.parse(storedNFTs)
                // Filter only active NFTs
                const activeNFTs = nfts.filter((nft: any) => nft.metadata?.isActive !== false)
                setAvailableNFTs(activeNFTs)
            }
        } catch (error) {
            console.error('Error loading NFTs:', error)
        }
    }

    // Get user's verification level from blockchain
    const [userVerificationLevel, setUserVerificationLevel] = useState(1)
    const [isLoadingLevel, setIsLoadingLevel] = useState(false)

    const loadVerificationLevel = async (showToast = false) => {
        if (!provider || !account) {
            // Default to level 1 if not connected
            setUserVerificationLevel(1)
            return
        }

        setIsLoadingLevel(true)
        try {
            const contract = getContract(provider)
            const level = await contract.getVerificationLevel(account)
            const levelNum = Number(level)

            console.log('Verification level from blockchain:', levelNum)

            // Check if level changed
            const previousLevel = userVerificationLevel
            const newLevel = levelNum || 1

            setUserVerificationLevel(newLevel)

            // Show toast if level changed and showToast is true
            if (showToast && previousLevel !== newLevel && previousLevel !== 1) {
                const levelInfo = getVerificationLevel(newLevel)
                toast.success(`🎉 Verification level updated to ${levelInfo.badge} ${levelInfo.title}!`)
            }
        } catch (error) {
            console.error('Error loading verification level:', error)
            setUserVerificationLevel(1) // Default to 1 on error
        } finally {
            setIsLoadingLevel(false)
        }
    }

    useEffect(() => {
        loadVerificationLevel(false) // Initial load without toast

        // Poll every 30 seconds to check for level updates
        const interval = setInterval(() => {
            loadVerificationLevel(true) // Show toast on auto-refresh if level changed
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [provider, account])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Determine if using NFT
        const nftInternalId = useNFT && selectedNFTId ? parseInt(selectedNFTId) : undefined

        // Call onSuccess to save loan (toast will be shown from parent)
        await onSuccess({
            cropType: formData.cropType,
            expectedYield: formData.expectedYield,
            estimatedValue: formData.estimatedValue,
            harvestDate: formData.harvestDate,
            loanAmount: formData.loanAmount,
            interestRate: formData.interestRate,
            duration: formData.duration,
            status: 'Pending'
        }, nftInternalId)

        // Reset form
        setStep(1)
        setUseNFT(false)
        setSelectedNFTId('')
        setFormData({
            cropType: '',
            expectedYield: '',
            estimatedValue: '',
            harvestDate: '',
            loanAmount: '',
            interestRate: '5',
            duration: '90'
        })
        if (onClearNFT) onClearNFT()
    }

    // Get verification info
    const verificationInfo = getVerificationLevel(userVerificationLevel)

    // Calculate max loan amounts
    const maxCollateralAmount = parseFloat(formData.estimatedValue || '0') * 0.7
    const maxLoanAmount = Math.min(maxCollateralAmount, verificationInfo.maxLoan)
    const totalRepayment = parseFloat(formData.loanAmount || '0') * (1 + parseFloat(formData.interestRate || '0') / 100)

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
                                }`}>
                                1
                            </div>
                            <span className="font-medium hidden sm:inline">Harvest Details</span>
                        </div>
                        <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
                                }`}>
                                2
                            </div>
                            <span className="font-medium hidden sm:inline">Loan Request</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">
                        {step === 1 ? '🌾 Step 1: Tokenize Your Harvest' : '💰 Step 2: Request Loan'}
                    </h2>
                    {selectedNFT && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedNFTId('')
                                setUseNFT(false)
                                if (onClearNFT) onClearNFT()
                                toast.success('NFT selection cleared')
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                            <X className="w-4 h-4" />
                            Clear NFT
                        </button>
                    )}
                </div>

                {useNFT && selectedNFTId && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <Wheat className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-green-900">Using NFT as Collateral</p>
                                <p className="text-sm text-green-700">
                                    {formData.cropType} Harvest - {formData.estimatedValue} HBAR
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                                NFT #{selectedNFTId}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                        <>
                            {/* NFT Selection Option */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        id="useNFT"
                                        checked={useNFT}
                                        onChange={(e) => {
                                            setUseNFT(e.target.checked)
                                            if (!e.target.checked) {
                                                setSelectedNFTId('')
                                                if (onClearNFT) onClearNFT()
                                            }
                                        }}
                                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="useNFT" className="font-semibold text-green-900 cursor-pointer flex items-center gap-2">
                                            <Wheat className="w-5 h-5" />
                                            Use Existing Harvest NFT as Collateral
                                        </label>
                                        <p className="text-sm text-green-700 mt-1">
                                            Select an NFT you've already created to use as collateral for this loan
                                        </p>
                                    </div>
                                </div>

                                {useNFT && (
                                    <div className="mt-4">
                                        <label className="label">Select Your NFT *</label>
                                        <select
                                            className="input"
                                            value={selectedNFTId}
                                            onChange={(e) => {
                                                const nftId = e.target.value
                                                setSelectedNFTId(nftId)

                                                // Auto-fill form with NFT data
                                                const nft = availableNFTs.find(n => n.internalId?.toString() === nftId)
                                                if (nft) {
                                                    setFormData({
                                                        ...formData,
                                                        cropType: nft.metadata.cropType || '',
                                                        expectedYield: nft.metadata.expectedYield?.toString() || '',
                                                        estimatedValue: nft.metadata.estimatedValue?.toString() || '',
                                                        harvestDate: nft.metadata.harvestDate || ''
                                                    })
                                                }
                                            }}
                                            required={useNFT}
                                        >
                                            <option value="">Choose an NFT...</option>
                                            {availableNFTs.map((nft, index) => (
                                                <option key={index} value={nft.internalId || index}>
                                                    {nft.metadata.cropType} - {nft.metadata.estimatedValue} HBAR - Serial #{nft.serialNumber}
                                                </option>
                                            ))}
                                        </select>
                                        {availableNFTs.length === 0 && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                ℹ️ No existing NFTs. Uncheck this option to create a new harvest token.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Harvest Details - Auto-filled if NFT selected */}
                            <div className={useNFT && selectedNFTId ? 'opacity-75' : ''}>
                                {useNFT && selectedNFTId && (
                                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Lock className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-900 mb-1">
                                                    🔒 Harvest Details Locked
                                                </p>
                                                <p className="text-sm text-green-800">
                                                    These fields are auto-filled from your NFT and cannot be changed.
                                                    This ensures data consistency between your NFT and loan request.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="label">Crop Type *</label>
                                    <select
                                        className={`input ${useNFT && selectedNFTId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        value={formData.cropType}
                                        onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                        required
                                        disabled={useNFT && selectedNFTId !== ''}
                                    >
                                        <option value="">Select your crop type</option>
                                        <option value="Corn">🌽 Corn</option>
                                        <option value="Rice">🌾 Rice</option>
                                        <option value="Wheat">🌾 Wheat</option>
                                        <option value="Soybean">🫘 Soybean</option>
                                        <option value="Coffee">☕ Coffee</option>
                                        <option value="Cotton">🌱 Cotton</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Expected Yield (kg) *</label>
                                    <input
                                        type="number"
                                        className={`input ${useNFT && selectedNFTId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="e.g., 2000"
                                        value={formData.expectedYield}
                                        onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                                        required
                                        disabled={useNFT && selectedNFTId !== ''}
                                        readOnly={useNFT && selectedNFTId !== ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Estimated harvest quantity</p>
                                </div>

                                <div>
                                    <label className="label">Estimated Value (HBAR) *</label>
                                    <input
                                        type="number"
                                        className={`input ${useNFT && selectedNFTId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="e.g., 2000"
                                        value={formData.estimatedValue}
                                        onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                                        min="1"
                                        max="10000000"
                                        step="0.01"
                                        required
                                        disabled={useNFT && selectedNFTId !== ''}
                                        readOnly={useNFT && selectedNFTId !== ''}
                                    />
                                    <div className="mt-1 space-y-1">
                                        <p className="text-xs text-gray-500">Total market value in HBAR</p>
                                        <p className="text-xs text-blue-600 font-medium">
                                            💡 Enter in HBAR (e.g., 2000 for two thousand HBAR)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">Expected Harvest Date *</label>
                                <input
                                    type="date"
                                    disabled={useNFT && selectedNFTId !== ''}
                                    readOnly={useNFT && selectedNFTId !== ''}
                                    className={`input ${useNFT && selectedNFTId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    value={formData.harvestDate}
                                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">When do you expect to harvest?</p>
                            </div>

                            {/* Verification Level Info */}
                            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3 flex-1">
                                        <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-primary-900">
                                                    Your Verification Level: {verificationInfo.badge} {verificationInfo.title}
                                                </p>
                                                {isLoadingLevel && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-primary-800">
                                                Max loan amount: <span className="font-bold">{verificationInfo.maxLoanDisplay}</span> |
                                                Interest range: <span className="font-bold">{verificationInfo.interestRange}</span>
                                            </p>
                                            <button
                                                onClick={() => loadVerificationLevel(true)}
                                                disabled={isLoadingLevel}
                                                className="text-xs text-primary-600 hover:text-primary-700 underline mt-1 disabled:opacity-50"
                                            >
                                                🔄 Refresh Level
                                            </button>
                                        </div>
                                    </div>
                                    <Link href="/farmer/verification" className="btn-secondary text-sm py-1 px-3 whitespace-nowrap">
                                        Upgrade
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-900 mb-1">Collateral Information</p>
                                        <p className="text-sm text-blue-800">
                                            Your harvest will be tokenized as collateral. You can borrow up to 70% of the estimated value,
                                            limited by your verification level.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn-primary w-full py-3 text-lg"
                                disabled={!formData.cropType || !formData.expectedYield || !formData.estimatedValue || !formData.harvestDate}
                            >
                                Next: Request Loan →
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary-600" />
                                    Harvest Token Summary
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Crop Type</p>
                                        <p className="font-bold">{formData.cropType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Expected Yield</p>
                                        <p className="font-bold">{formData.expectedYield} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Estimated Value</p>
                                        <p className="font-bold">{formData.estimatedValue} HBAR</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label">Loan Amount (HBAR) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="Enter loan amount in HBAR (e.g., 140)"
                                    value={formData.loanAmount}
                                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                                    min="1"
                                    max={maxLoanAmount}
                                    step="0.01"
                                    required
                                />
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-blue-600 font-medium">
                                        💡 Enter in HBAR (e.g., 140 for one hundred forty HBAR)
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        • Collateral limit: {maxCollateralAmount.toFixed(2)} HBAR (70% of harvest value)
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        • Verification limit: {verificationInfo.maxLoanDisplay} ({verificationInfo.title} level)
                                    </p>
                                    <p className="text-xs font-bold text-primary-600">
                                        → Maximum you can request: {maxLoanAmount.toFixed(2)} HBAR
                                    </p>
                                    {maxCollateralAmount > verificationInfo.maxLoan && (
                                        <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-800">
                                                Your collateral allows ${maxCollateralAmount.toFixed(2)}, but your verification level limits you to {verificationInfo.maxLoanDisplay}.
                                                <Link href="/farmer/verification" className="underline font-medium ml-1">Upgrade verification</Link> to unlock higher limits.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Interest Rate (%) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        step="0.1"
                                        min={verificationInfo.minInterest}
                                        max={verificationInfo.maxInterest}
                                        value={formData.interestRate}
                                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Your range: {verificationInfo.interestRange} ({verificationInfo.title} level)
                                    </p>
                                </div>

                                <div>
                                    <label className="label">Duration (days) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Loan period</p>
                                </div>
                            </div>

                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                                <h3 className="font-bold mb-4 text-primary-900">Loan Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Loan Amount:</span>
                                        <span className="font-bold">{formData.loanAmount || '0'} HBAR</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Interest ({formData.interestRate}%):</span>
                                        <span className="font-bold text-green-600">
                                            +{((parseFloat(formData.loanAmount || '0') * parseFloat(formData.interestRate || '0')) / 100).toFixed(2)} HBAR
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Duration:</span>
                                        <span className="font-bold">{formData.duration} days</span>
                                    </div>
                                    <div className="border-t border-primary-300 pt-3 flex justify-between">
                                        <span className="text-lg font-bold text-primary-900">Total Repayment:</span>
                                        <span className="text-lg font-bold text-primary-600">{totalRepayment.toFixed(2)} HBAR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-secondary flex-1 py-3"
                                    disabled={isSubmitting}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1 py-3 text-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing on Blockchain...' : 'Submit Loan Request'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    )
}

function MyLoans({
    loans,
    provider,
    account,
    blockchainLoans,
    setBlockchainLoans,
    setTotalRequested,
    setTotalFunded,
    setActiveLoansCount,
    setCompletedLoansCount
}: {
    loans: CreatedLoan[]
    provider: any
    account: string | null
    blockchainLoans: any[]
    setBlockchainLoans: (loans: any[]) => void
    setTotalRequested: (value: string) => void
    setTotalFunded: (value: string) => void
    setActiveLoansCount: (value: number) => void
    setCompletedLoansCount: (value: number) => void
}) {
    // Load loans from blockchain
    useEffect(() => {
        const loadBlockchainLoans = async () => {
            if (!provider || !account) return

            try {
                const contract = getContract(provider)
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

                if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                    console.log('⚠️ Contract address not configured, skipping blockchain loans')
                    return
                }

                // Get farmer's loan IDs
                console.log('📡 Loading blockchain loans for:', account)
                const loanIds = await contract.getFarmerLoans(account)
                console.log('📡 Found loan IDs:', loanIds)

                const farmerLoans = await Promise.all(loanIds.map(async (loanId: bigint) => {
                    try {
                        const loanDetails = await contract.getLoanDetails(loanId)
                        const harvestToken = await contract.harvestTokens(loanDetails.harvestTokenId)

                        // Get investments to calculate funded amount
                        const investments = await contract.getLoanInvestments(loanId)
                        const totalFunded = investments.reduce((sum: bigint, inv: any) => sum + inv.amount, BigInt(0))

                        return {
                            id: Number(loanId),
                            cropType: harvestToken.cropType,
                            requestedAmount: ethers.formatEther(loanDetails.requestedAmount), // Convert from wei to HBAR
                            fundedAmount: ethers.formatEther(totalFunded), // Convert from wei to HBAR
                            interestRate: Number(loanDetails.interestRate),
                            duration: Number(loanDetails.duration),
                            status: Number(loanDetails.status),
                            txHash: 'blockchain', // On-chain loans have tx hash
                            isOnChain: true
                        }
                    } catch (error) {
                        console.error('Error loading loan:', error)
                        return null
                    }
                }))

                const validLoans = farmerLoans.filter(loan => loan !== null)
                setBlockchainLoans(validLoans)

                // Calculate stats
                const totalReq = validLoans.reduce((sum, loan) => sum + parseFloat(loan.requestedAmount || '0'), 0)
                const totalFund = validLoans.reduce((sum, loan) => sum + parseFloat(loan.fundedAmount || '0'), 0)
                const active = validLoans.filter(loan => loan.status === 0 || loan.status === 1).length
                const completed = validLoans.filter(loan => loan.status === 2).length

                setTotalRequested(totalReq.toFixed(2))
                setTotalFunded(totalFund.toFixed(2))
                setActiveLoansCount(active)
                setCompletedLoansCount(completed)
            } catch (error) {
                console.error('❌ Error loading blockchain loans:', error)
                // Don't throw, just log and continue
                // This ensures the error doesn't block other functionality
            }
        }

        // Use setTimeout to ensure this doesn't block other operations
        setTimeout(() => {
            loadBlockchainLoans().catch(err => {
                console.error('❌ Async error in loadBlockchainLoans:', err)
            })
        }, 100)
    }, [provider, account])

    // Also update stats when loans from localStorage change
    useEffect(() => {
        const onChainLoans = loans.filter(loan => loan.isOnChain && loan.txHash)
        const allLoans = [...onChainLoans, ...blockchainLoans]

        const totalReq = allLoans.reduce((sum, loan) => sum + parseFloat(loan.requestedAmount || '0'), 0)
        const totalFund = allLoans.reduce((sum, loan) => sum + parseFloat(loan.fundedAmount || '0'), 0)
        const active = allLoans.filter(loan => loan.status === 0 || loan.status === 1).length
        const completed = allLoans.filter(loan => loan.status === 2).length

        setTotalRequested(totalReq.toFixed(2))
        setTotalFunded(totalFund.toFixed(2))
        setActiveLoansCount(active)
        setCompletedLoansCount(completed)
    }, [loans, blockchainLoans])

    // Filter loans to show only on-chain loans
    const onChainLoans = loans.filter(loan => loan.isOnChain && loan.txHash)

    // Combine on-chain loans from localStorage and blockchain, removing duplicates
    const combinedLoans = [...onChainLoans, ...blockchainLoans]
    const allLoans = combinedLoans.reduce((acc: any[], current: any) => {
        const exists = acc.find(loan => loan.id === current.id)
        if (!exists) {
            acc.push(current)
        }
        return acc
    }, [])

    return (
        <div>
            {allLoans.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <List className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Loans Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't created any loan requests yet.</p>
                    <button onClick={() => { }} className="btn-primary">
                        Create Your First Loan
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {allLoans.map((loan) => {
                        // Safe calculation for funding progress
                        const fundedAmount = parseFloat(loan.fundedAmount || '0')
                        const requestedAmount = parseFloat(loan.requestedAmount || loan.loanAmount || '0')
                        const progress = requestedAmount > 0 ? (fundedAmount / requestedAmount) * 100 : 0

                        return (
                            <div key={loan.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Sprout className="w-8 h-8 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">{loan.cropType} Harvest</h3>
                                            <p className="text-sm text-gray-600">Loan #{loan.id}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${loan.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        loan.status === 1 ? 'bg-blue-100 text-blue-800' :
                                            loan.status === 2 ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {loan.status === 0 ? '⏳ Pending' : loan.status === 1 ? '✅ Funded' : loan.status === 2 ? '🎉 Repaid' : 'Active'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Requested</p>
                                        <p className="text-xl font-bold">{requestedAmount.toFixed(2)} HBAR</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Funded</p>
                                        <p className="text-xl font-bold text-green-600">{fundedAmount.toFixed(2)} HBAR</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Interest</p>
                                        <p className="text-xl font-bold">
                                            {(() => {
                                                // Handle different interest rate formats
                                                // If > 100, it's in basis points (500 = 5%)
                                                // If < 100, it's already in percentage (5 = 5%)
                                                const interestRate = Number(loan.interestRate) || 0
                                                const rate = interestRate > 100
                                                    ? interestRate / 100
                                                    : interestRate
                                                return rate.toFixed(1)
                                            })()}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Duration</p>
                                        <p className="text-xl font-bold">{loan.duration} days</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600 font-medium">Funding Progress</span>
                                        <span className="font-bold text-primary-600">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {fundedAmount.toFixed(2)} / {requestedAmount.toFixed(2)} HBAR funded
                                    </p>
                                </div>
                                {/* Blockchain Verification */}
                                {loan.isOnChain && loan.txHash && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-xs font-medium text-green-800">On-Chain Verified</span>
                                            </div>
                                            {loan.txHash !== 'blockchain' && (
                                                <a
                                                    href={`https://hashscan.io/testnet/tx/${loan.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                                                >
                                                    View Tx
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
