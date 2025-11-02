'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { Sprout, Plus, List, TrendingUp, DollarSign, Calendar, Package, AlertCircle, CheckCircle2, Clock, Shield, Lock, ExternalLink, Wheat, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getVerificationLevel } from '@/lib/verificationLevels'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import { hbarToWei, hbarToTinybar, tinybarToHBAR, weiToHBAR, debugHBARTransaction, validateHBARAmount, formatHBARNumber } from '@/lib/hbarUtils'
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
    const [activeTab, setActiveTab] = useState<'create' | 'nfts'>('create')
    const [showNewLoanToast, setShowNewLoanToast] = useState(false)
    const [selectedNFTForLoan, setSelectedNFTForLoan] = useState<any>(null)
    const [farmerName, setFarmerName] = useState('Farmer')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [blockchainLoans, setBlockchainLoans] = useState<any[]>([])

    // Stats from blockchain
    const [totalRequested, setTotalRequested] = useState<string>('0')
    const [totalFunded, setTotalFunded] = useState<string>('0')
    const [activeLoansCount, setActiveLoansCount] = useState<number>(0)
    const [completedLoansCount, setCompletedLoansCount] = useState<number>(0)

    // Load created loans from localStorage
    const [farmerLoans, setFarmerLoans] = useState<CreatedLoan[]>(() => {
        if (typeof window !== 'undefined') {
            // Check if using new contract - clear old data
            const currentContract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
            const savedContract = localStorage.getItem('lastContractAddress')

            if (currentContract && savedContract && currentContract !== savedContract) {
                // New contract detected - clear old data
                console.log('🔄 New contract detected, clearing old localStorage data')
                localStorage.removeItem('farmerCreatedLoans')
                localStorage.removeItem('marketplaceLoans')
                localStorage.setItem('lastContractAddress', currentContract)
                return []
            }

            if (currentContract) {
                localStorage.setItem('lastContractAddress', currentContract)
            }

            const saved = localStorage.getItem('farmerCreatedLoans')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })

    // Function to add new loan
    const addLoanToHistory = async (loanData: Omit<CreatedLoan, 'id' | 'createdAt'>, nftData?: any) => {
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

            // Validate amounts before sending
            const estimatedValueValidation = validateHBARAmount(loanData.estimatedValue, 1, 10000000)
            if (estimatedValueValidation) {
                throw new Error(`Invalid estimated value: ${estimatedValueValidation}`)
            }

            const loanAmountValidation = validateHBARAmount(loanData.loanAmount, 1, 1000000)
            if (loanAmountValidation) {
                throw new Error(`Invalid loan amount: ${loanAmountValidation}`)
            }

            let harvestTokenId: bigint

            // If NFT is provided, use createHarvestTokenFromNFT
            if (nftData?.internalId) {
                const loadingToast1 = toast.loading('Step 1/2: Creating harvest token from NFT...')
                
                try {
                    // Call createHarvestTokenFromNFT with internal ID
                    const createTokenTx = await contract.createHarvestTokenFromNFT(
                        BigInt(nftData.internalId)
                    )
                    
                    const createTokenReceipt = await createTokenTx.wait()
                    
                    // Dismiss loading toast
                    toast.dismiss(loadingToast1)
                    toast.success('Harvest token created from NFT!')
                    
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
                    
                } catch (error: any) {
                    toast.dismiss(loadingToast1)
                    // If NFT creation fails, fall back to legacy method
                    console.warn('Failed to create token from NFT, falling back to legacy method:', error)
                    toast.error('NFT creation failed. Using legacy method instead.')
                    
                    // Fall through to legacy createHarvestToken
                    const harvestDate = Math.floor(new Date(loanData.harvestDate).getTime() / 1000)
                    const loadingToastLegacy = toast.loading('Creating harvest token on blockchain...')
                    
                    const estimatedValueWei = hbarToWei(loanData.estimatedValue)
                    const mockTokenAddress = '0x0000000000000000000000000000000000000001'
                    
                    const createTokenTx = await contract.createHarvestToken(
                        mockTokenAddress,
                        loanData.cropType,
                        ethers.parseUnits(loanData.expectedYield, 0),
                        estimatedValueWei,
                        harvestDate
                    )
                    
                    const createTokenReceipt = await createTokenTx.wait()
                    toast.dismiss(loadingToastLegacy)
                    
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
            } else {
                // Step 1: Create harvest token (legacy method)
                const loadingToast1 = toast.loading('Step 1/2: Creating harvest token on blockchain...')

                const harvestDate = Math.floor(new Date(loanData.harvestDate).getTime() / 1000)
                const estimatedValueWei = hbarToWei(loanData.estimatedValue)
                console.log('Creating harvest token with estimated value:', loanData.estimatedValue, 'HBAR =', estimatedValueWei.toString(), 'wei')

                // Use placeholder token address (in production, would create actual HTS token)
                const mockTokenAddress = '0x0000000000000000000000000000000000000001'

                const createTokenTx = await contract.createHarvestToken(
                    mockTokenAddress, // token address
                    loanData.cropType, // crop type
                    ethers.parseUnits(loanData.expectedYield, 0), // expected yield in kg
                    estimatedValueWei, // estimated value in HBAR wei (18 decimals)
                    harvestDate // harvest date timestamp
                )

                const createTokenReceipt = await createTokenTx.wait()

                // Dismiss loading toast
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

            // Convert loan amount to wei (for internal storage in smart contract)
            const loanAmountWei = hbarToWei(loanData.loanAmount)
            
            // Convert interest rate to basis points (e.g., 5% = 500 basis points)
            const interestRateBasisPoints = BigInt(Math.floor(parseFloat(loanData.interestRate) * 100))
            
            console.log('Requesting loan with amount:', loanData.loanAmount, 'HBAR =', loanAmountWei.toString(), 'wei')
            console.log('Harvest token ID:', harvestTokenId.toString())
            console.log('Interest rate:', loanData.interestRate, '% =', interestRateBasisPoints.toString(), 'basis points')
            console.log('Duration:', loanData.duration, 'days')

            const requestLoanTx = await contract.requestLoan(
                harvestTokenId, // harvest token ID (from NFT or newly created)
                loanAmountWei, // loan amount in HBAR wei (18 decimals)
                interestRateBasisPoints, // interest rate in basis points (500 = 5%)
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
                    interestRate: parseInt(newLoan.interestRate) * 100,
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

                // Clear selected NFT after successful loan creation
                setSelectedNFTForLoan(null)
            }

        } catch (error: any) {
            console.error('Error creating loan:', error)

            // Show user-friendly error message
            let errorMessage = 'Failed to create loan on blockchain'

            if (error.message?.includes('revert')) {
                const revertMatch = error.message.match(/revert\s+(.+)/i)
                if (revertMatch) {
                    errorMessage = revertMatch[1]
                } else {
                    // Try to extract revert reason from data
                    errorMessage = error.reason || errorMessage
                }
            } else if (error.message?.includes('RPC endpoint returned HTTP client error') ||
                error.message?.includes('RPC Error') ||
                error.message?.includes('Internal JSON-RPC error')) {
                errorMessage = 'Hedera Testnet is experiencing issues. Please try again in a few moments.'
            } else if (error.message?.includes('missing revert data')) {
                errorMessage = 'Transaction would fail. Please check:\n- NFT is active and owned by you\n- Loan amount does not exceed 70% of collateral\n- Interest rate and duration are valid'
            } else if (error.message) {
                errorMessage = error.message
            }

            toast.error(errorMessage, { duration: 8000 })

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
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'create'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <Plus className="w-5 h-5" />
                        Create New Loan
                    </button>

                    <button
                        onClick={() => setActiveTab('nfts')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'nfts'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <Wheat className="w-5 h-5" />
                        Harvest NFTs 🆕
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'create' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Create New Loan</h3>
                            <CreateLoanForm
                                onSuccess={addLoanToHistory}
                                isSubmitting={isSubmitting}
                                provider={provider}
                                account={account}
                                selectedNFT={selectedNFTForLoan}
                                onClearNFT={() => setSelectedNFTForLoan(null)}
                                onSwitchToNFTTab={() => setActiveTab('nfts')}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-3">My Loans</h3>
                            <MyLoans 
                                loans={farmerLoans} 
                                provider={provider} 
                                account={account}
                                signer={signer}
                                blockchainLoans={blockchainLoans} 
                                setBlockchainLoans={setBlockchainLoans} 
                                setTotalRequested={setTotalRequested} 
                                setTotalFunded={setTotalFunded} 
                                setActiveLoansCount={setActiveLoansCount} 
                                setCompletedLoansCount={setCompletedLoansCount} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Wheat className="w-5 h-5" />
                                🎉 Harvest NFTs - Use as Collateral
                            </h3>
                            <p className="text-blue-800 text-sm">
                                Your harvest tokens are now real NFTs on Hedera blockchain!
                                They can be verified on HashScan, transferred between wallets,
                                and used as collateral for loans. Each NFT costs only ~0.05 HBAR (~$0.005) to create.
                                Click "Request Loan" on any active NFT to use it as collateral.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Create Harvest NFT</h3>
                                <CreateHarvestNFTForm
                                    farmerAddress={account || ''}
                                    farmerName={farmerName}
                                    onSuccess={(nft) => {
                                        toast.success('NFT created! You can now use it for loans.')
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-4">My Harvest NFTs</h3>
                                <MyHarvestNFTs
                                    farmerAddress={account || ''}
                                    onCreateLoan={(nft) => {
                                        setSelectedNFTForLoan(nft)
                                        setActiveTab('create')
                                        toast.success('NFT selected! Fill in loan details.')
                                    }}
                                />
                            </div>
                        </div>
                    </div>
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

function CreateLoanForm({ 
    onSuccess, 
    isSubmitting,
    selectedNFT,
    onClearNFT,
    provider,
    account,
    onSwitchToNFTTab
}: {
    onSuccess: (loanData: Omit<CreatedLoan, 'id' | 'createdAt'>, nftData?: any) => Promise<void>
    isSubmitting: boolean
    selectedNFT?: any
    onClearNFT?: () => void
    provider?: any
    account?: string | null
    onSwitchToNFTTab?: () => void
}) {
    // If NFT is selected, skip Step 1 and auto-fill form
    const [step, setStep] = useState(selectedNFT ? 2 : 1)
    const [formData, setFormData] = useState({
        cropType: selectedNFT?.metadata?.cropType || '',
        expectedYield: selectedNFT?.metadata?.expectedYield?.toString() || '',
        estimatedValue: selectedNFT?.metadata?.estimatedValue?.toString() || '',
        harvestDate: selectedNFT?.metadata?.harvestDate || '',
        loanAmount: '',
        interestRate: '5',
        duration: '90'
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [nftData, setNftData] = useState<any>(selectedNFT || null)

    // Get user's verification level (default to level 1)
    const [userVerificationLevel, setUserVerificationLevel] = useState(1)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLevel = localStorage.getItem('userVerificationLevel')
            setUserVerificationLevel(savedLevel ? parseInt(savedLevel) : 1)
        }
    }, [])

    // Auto-fill form when NFT is selected
    useEffect(() => {
        if (selectedNFT?.metadata) {
            setFormData({
                cropType: selectedNFT.metadata.cropType || '',
                expectedYield: selectedNFT.metadata.expectedYield?.toString() || '',
                estimatedValue: selectedNFT.metadata.estimatedValue?.toString() || '',
                harvestDate: selectedNFT.metadata.harvestDate || '',
                loanAmount: '',
                interestRate: '5',
                duration: '90'
            })
            setNftData(selectedNFT)
            setStep(2) // Skip to loan request step
        }
    }, [selectedNFT])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const errors: Record<string, string> = {}
        
        if (step === 1) {
            if (!formData.cropType) errors.cropType = 'Crop type is required'
            if (!formData.expectedYield || parseFloat(formData.expectedYield) <= 0) {
                errors.expectedYield = 'Expected yield must be greater than 0'
            }
            if (!formData.estimatedValue || parseFloat(formData.estimatedValue) <= 0) {
                errors.estimatedValue = 'Estimated value must be greater than 0'
            }
            if (!formData.harvestDate) {
                errors.harvestDate = 'Harvest date is required'
            } else if (new Date(formData.harvestDate) <= new Date()) {
                errors.harvestDate = 'Harvest date must be in the future'
            }
        } else {
            if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
                errors.loanAmount = 'Loan amount is required'
            } else if (parseFloat(formData.loanAmount) > maxLoanAmount) {
                errors.loanAmount = `Loan amount cannot exceed ${maxLoanAmount.toFixed(2)} HBAR`
            }
            if (!formData.interestRate || parseFloat(formData.interestRate) < verificationInfo.minInterest || parseFloat(formData.interestRate) > verificationInfo.maxInterest) {
                errors.interestRate = `Interest rate must be between ${verificationInfo.minInterest}% and ${verificationInfo.maxInterest}%`
            }
            if (!formData.duration || parseFloat(formData.duration) <= 0) {
                errors.duration = 'Duration must be greater than 0'
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            toast.error('Please fix the errors in the form')
            return
        }

        setFormErrors({})

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
        }, nftData)

        // Reset form
        setStep(selectedNFT ? 2 : 1)
        setFormData({
            cropType: selectedNFT?.metadata?.cropType || '',
            expectedYield: selectedNFT?.metadata?.expectedYield?.toString() || '',
            estimatedValue: selectedNFT?.metadata?.estimatedValue?.toString() || '',
            harvestDate: selectedNFT?.metadata?.harvestDate || '',
            loanAmount: '',
            interestRate: '5',
            duration: '90'
        })
        setFormErrors({})
        if (onClearNFT) {
            onClearNFT()
        }
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

                <h2 className="text-2xl font-bold mb-6">
                    {step === 1 ? '🌾 Step 1: Tokenize Your Harvest' : '💰 Step 2: Request Loan'}
                </h2>

                {/* Show selected NFT info */}
                {selectedNFT && step === 2 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Wheat className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-green-900">Using Harvest NFT as Collateral</h3>
                                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                                            NFT Selected
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-green-700 font-medium">Crop</p>
                                            <p className="text-green-900 font-bold">{selectedNFT.metadata.cropType}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-700 font-medium">Value</p>
                                            <p className="text-green-900 font-bold">{selectedNFT.metadata.estimatedValue} HBAR</p>
                                        </div>
                                        <div>
                                            <p className="text-green-700 font-medium">Yield</p>
                                            <p className="text-green-900 font-bold">{selectedNFT.metadata.expectedYield} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-green-700 font-medium">Max Loan</p>
                                            <p className="text-green-900 font-bold">{Math.floor(selectedNFT.metadata.estimatedValue * 0.7)} HBAR</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`https://hashscan.io/testnet/token/${selectedNFT.tokenId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-900 mt-2"
                                    >
                                        View on HashScan <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            {onClearNFT && (
                                <button
                                    type="button"
                                    onClick={onClearNFT}
                                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                    title="Clear NFT selection"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Call-to-action if no NFT selected */}
                {!selectedNFT && step === 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Wheat className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 mb-2">💡 Tip: Use Harvest NFT for Better Experience</h3>
                                <p className="text-sm text-blue-800 mb-4">
                                    Create a Harvest NFT first to use as collateral. This makes the loan process faster and your harvest is verifiable on blockchain.
                                </p>
                                {onSwitchToNFTTab && (
                                    <button
                                        type="button"
                                        onClick={onSwitchToNFTTab}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                                    >
                                        Go to Harvest NFTs tab →
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                        <>
                            <div>
                                <label className="label">Crop Type *</label>
                                <select
                                    className={`input ${formErrors.cropType ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    value={formData.cropType}
                                    onChange={(e) => {
                                        setFormData({ ...formData, cropType: e.target.value })
                                        if (formErrors.cropType) {
                                            setFormErrors({ ...formErrors, cropType: '' })
                                        }
                                    }}
                                    required
                                >
                                    <option value="">Select your crop type</option>
                                    
                                    {/* Cereals & Grains */}
                                    <optgroup label="🌾 Cereals & Grains">
                                        <option value="Rice">Rice</option>
                                        <option value="Wheat">Wheat</option>
                                        <option value="Corn">Corn</option>
                                        <option value="Barley">Barley</option>
                                        <option value="Oats">Oats</option>
                                        <option value="Sorghum">Sorghum</option>
                                        <option value="Millet">Millet</option>
                                    </optgroup>
                                    
                                    {/* Legumes */}
                                    <optgroup label="🫘 Legumes">
                                        <option value="Soybean">Soybean</option>
                                        <option value="Peanut">Peanut</option>
                                        <option value="Green Bean">Green Bean</option>
                                        <option value="Red Bean">Red Bean</option>
                                        <option value="Chickpea">Chickpea</option>
                                        <option value="Lentil">Lentil</option>
                                    </optgroup>
                                    
                                    {/* Vegetables */}
                                    <optgroup label="🥬 Vegetables">
                                        <option value="Tomato">Tomato</option>
                                        <option value="Potato">Potato</option>
                                        <option value="Onion">Onion</option>
                                        <option value="Garlic">Garlic</option>
                                        <option value="Cabbage">Cabbage</option>
                                        <option value="Carrot">Carrot</option>
                                        <option value="Chili">Chili</option>
                                        <option value="Eggplant">Eggplant</option>
                                        <option value="Cucumber">Cucumber</option>
                                        <option value="Lettuce">Lettuce</option>
                                    </optgroup>
                                    
                                    {/* Fruits */}
                                    <optgroup label="🍎 Fruits">
                                        <option value="Banana">Banana</option>
                                        <option value="Mango">Mango</option>
                                        <option value="Papaya">Papaya</option>
                                        <option value="Pineapple">Pineapple</option>
                                        <option value="Watermelon">Watermelon</option>
                                        <option value="Melon">Melon</option>
                                        <option value="Orange">Orange</option>
                                        <option value="Apple">Apple</option>
                                        <option value="Strawberry">Strawberry</option>
                                        <option value="Durian">Durian</option>
                                    </optgroup>
                                    
                                    {/* Cash Crops */}
                                    <optgroup label="☕ Cash Crops">
                                        <option value="Coffee">Coffee</option>
                                        <option value="Cocoa">Cocoa</option>
                                        <option value="Tea">Tea</option>
                                        <option value="Rubber">Rubber</option>
                                        <option value="Palm Oil">Palm Oil</option>
                                        <option value="Sugarcane">Sugarcane</option>
                                        <option value="Cotton">Cotton</option>
                                        <option value="Tobacco">Tobacco</option>
                                    </optgroup>
                                    
                                    {/* Spices & Herbs */}
                                    <optgroup label="🌿 Spices & Herbs">
                                        <option value="Black Pepper">Black Pepper</option>
                                        <option value="Ginger">Ginger</option>
                                        <option value="Turmeric">Turmeric</option>
                                        <option value="Galangal">Galangal</option>
                                        <option value="Lemongrass">Lemongrass</option>
                                        <option value="Vanilla">Vanilla</option>
                                        <option value="Cinnamon">Cinnamon</option>
                                        <option value="Clove">Clove</option>
                                        <option value="Nutmeg">Nutmeg</option>
                                    </optgroup>
                                    
                                    {/* Root Crops */}
                                    <optgroup label="🥔 Root Crops">
                                        <option value="Cassava">Cassava</option>
                                        <option value="Sweet Potato">Sweet Potato</option>
                                        <option value="Taro">Taro</option>
                                        <option value="Yam">Yam</option>
                                    </optgroup>
                                    
                                    {/* Other */}
                                    <optgroup label="🌱 Other">
                                        <option value="Mushroom">Mushroom</option>
                                        <option value="Bamboo">Bamboo</option>
                                        <option value="Other">Other</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Expected Yield (kg) *</label>
                                    <input
                                        type="number"
                                        className={`input ${formErrors.expectedYield ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="e.g., 2000"
                                        value={formData.expectedYield}
                                        onChange={(e) => {
                                            setFormData({ ...formData, expectedYield: e.target.value })
                                            if (formErrors.expectedYield) {
                                                setFormErrors({ ...formErrors, expectedYield: '' })
                                            }
                                        }}
                                        required
                                    />
                                    {formErrors.expectedYield && (
                                        <p className="text-xs text-red-600 mt-1">{formErrors.expectedYield}</p>
                                    )}
                                    {!formErrors.expectedYield && (
                                        <p className="text-xs text-gray-500 mt-1">Estimated harvest quantity</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Estimated Value (HBAR) *</label>
                                    <input
                                        type="number"
                                        className={`input ${formErrors.estimatedValue ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="e.g., 2000"
                                        value={formData.estimatedValue}
                                        onChange={(e) => {
                                            setFormData({ ...formData, estimatedValue: e.target.value })
                                            if (formErrors.estimatedValue) {
                                                setFormErrors({ ...formErrors, estimatedValue: '' })
                                            }
                                        }}
                                        min="1"
                                        max="10000000"
                                        step="0.01"
                                        required
                                    />
                                    {formErrors.estimatedValue && (
                                        <p className="text-xs text-red-600 mt-1">{formErrors.estimatedValue}</p>
                                    )}
                                    {!formErrors.estimatedValue && (
                                        <div className="mt-1 space-y-1">
                                            <p className="text-xs text-gray-500">Total market value in HBAR</p>
                                            <p className="text-xs text-blue-600 font-medium">
                                                💡 Enter in HBAR (e.g., 2000 for two thousand HBAR)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="label">Expected Harvest Date *</label>
                                <input
                                    type="date"
                                    className={`input ${formErrors.harvestDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    value={formData.harvestDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, harvestDate: e.target.value })
                                        if (formErrors.harvestDate) {
                                            setFormErrors({ ...formErrors, harvestDate: '' })
                                        }
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {formErrors.harvestDate && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.harvestDate}</p>
                                )}
                                {!formErrors.harvestDate && (
                                    <p className="text-xs text-gray-500 mt-1">When do you expect to harvest?</p>
                                )}
                            </div>

                            {/* Verification Level Info */}
                            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-3 flex-1">
                                        <Shield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-primary-900 mb-1">
                                                Your Verification Level: {verificationInfo.badge} {verificationInfo.title}
                                            </p>
                                            <p className="text-sm text-primary-800">
                                                Max loan amount: <span className="font-bold">{verificationInfo.maxLoanDisplay}</span> |
                                                Interest range: <span className="font-bold">{verificationInfo.interestRange}</span>
                                            </p>
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
                                    className={`input ${formErrors.loanAmount ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Enter loan amount in HBAR (e.g., 140)"
                                    value={formData.loanAmount}
                                    onChange={(e) => {
                                        setFormData({ ...formData, loanAmount: e.target.value })
                                        if (formErrors.loanAmount) {
                                            setFormErrors({ ...formErrors, loanAmount: '' })
                                        }
                                    }}
                                    min="1"
                                    max={maxLoanAmount}
                                    step="0.01"
                                    required
                                />
                                {formErrors.loanAmount && (
                                    <p className="text-xs text-red-600 mt-1">{formErrors.loanAmount}</p>
                                )}
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
                                        className={`input ${formErrors.interestRate ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        step="0.1"
                                        min={verificationInfo.minInterest}
                                        max={verificationInfo.maxInterest}
                                        value={formData.interestRate}
                                        onChange={(e) => {
                                            setFormData({ ...formData, interestRate: e.target.value })
                                            if (formErrors.interestRate) {
                                                setFormErrors({ ...formErrors, interestRate: '' })
                                            }
                                        }}
                                        required
                                    />
                                    {formErrors.interestRate && (
                                        <p className="text-xs text-red-600 mt-1">{formErrors.interestRate}</p>
                                    )}
                                    {!formErrors.interestRate && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Your range: {verificationInfo.interestRange} ({verificationInfo.title} level)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">Duration (days) *</label>
                                    <input
                                        type="number"
                                        className={`input ${formErrors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        value={formData.duration}
                                        onChange={(e) => {
                                            setFormData({ ...formData, duration: e.target.value })
                                            if (formErrors.duration) {
                                                setFormErrors({ ...formErrors, duration: '' })
                                            }
                                        }}
                                        required
                                    />
                                    {formErrors.duration && (
                                        <p className="text-xs text-red-600 mt-1">{formErrors.duration}</p>
                                    )}
                                    {!formErrors.duration && (
                                        <p className="text-xs text-gray-500 mt-1">Loan period</p>
                                    )}
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
                                    className="btn-primary flex-1 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing on Blockchain...
                                        </span>
                                    ) : (
                                        'Submit Loan Request'
                                    )}
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
    signer,
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
    signer: any
    blockchainLoans: any[]
    setBlockchainLoans: (loans: any[]) => void
    setTotalRequested: (value: string) => void
    setTotalFunded: (value: string) => void
    setActiveLoansCount: (value: number) => void
    setCompletedLoansCount: (value: number) => void
}) {
    const [repayingLoans, setRepayingLoans] = useState<Set<number>>(new Set())
    // Load loans from blockchain
    useEffect(() => {
        const loadBlockchainLoans = async () => {
            if (!provider || !account) return

            try {
                const contract = getContract(provider)
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

                if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                    return
                }

                // Get farmer's loan IDs
                const loanIds = await contract.getFarmerLoans(account)

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
                console.error('Error loading blockchain loans:', error)
            }
        }

        loadBlockchainLoans()
    }, [provider, account])

    // Update stats based on blockchain loans
    useEffect(() => {
        const totalReq = blockchainLoans.reduce((sum, loan) => sum + parseFloat(loan.requestedAmount || '0'), 0)
        const totalFund = blockchainLoans.reduce((sum, loan) => sum + parseFloat(loan.fundedAmount || '0'), 0)
        const active = blockchainLoans.filter(loan => loan.status === 0 || loan.status === 1).length
        const completed = blockchainLoans.filter(loan => loan.status === 2).length

        setTotalRequested(totalReq.toFixed(2))
        setTotalFunded(totalFund.toFixed(2))
        setActiveLoansCount(active)
        setCompletedLoansCount(completed)
    }, [blockchainLoans])

    // Function to repay loan
    const handleRepayLoan = async (loanId: number, loan: any) => {
        if (!signer || !account) {
            toast.error('Please connect your wallet')
            return
        }

        try {
            setRepayingLoans(prev => new Set(prev).add(loanId))
            const contract = getContract(signer)

            // Get loan details to calculate repayment
            const loanDetails = await contract.getLoanDetails(loanId)

            // Calculate total repayment (principal + interest)
            const interest = (loanDetails.requestedAmount * BigInt(loanDetails.interestRate)) / BigInt(10000)
            const totalRepayment = loanDetails.requestedAmount + interest
            const totalRepaymentHBAR = parseFloat(weiToHBAR(totalRepayment.toString()))

            // Confirm repayment
            const confirmed = window.confirm(
                `Repay Loan #${loanId}?\n\n` +
                `Principal: ${formatHBARNumber(loan.requestedAmount)} HBAR\n` +
                `Interest: ${formatHBARNumber(parseFloat(weiToHBAR(interest.toString())))} HBAR\n` +
                `Total: ${formatHBARNumber(totalRepaymentHBAR.toString())} HBAR`
            )

            if (!confirmed) {
                setRepayingLoans(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(loanId)
                    return newSet
                })
                return
            }

            const loadingToast = toast.loading('Processing repayment on blockchain...')

            // Convert to tinybar for Hedera EVM (msg.value is in tinybar)
            const totalRepaymentTinybar = totalRepayment / BigInt(10 ** 10) // Convert wei to tinybar

            // Call repayLoan function
            const tx = await contract.repayLoan(loanId, {
                value: totalRepaymentTinybar
            })

            toast.dismiss(loadingToast)
            const waitingToast = toast.loading('Waiting for confirmation...')

            const receipt = await tx.wait()

            toast.dismiss(waitingToast)
            toast.success(`Successfully repaid loan! Total: ${formatHBARNumber(totalRepaymentHBAR.toString())} HBAR`)

            // Reload loans
            const loadBlockchainLoans = async () => {
                if (!provider || !account) return

                try {
                    const contract = getContract(provider)
                    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

                    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                        return
                    }

                    const loanIds = await contract.getFarmerLoans(account)

                    const farmerLoans = await Promise.all(loanIds.map(async (loanId: bigint) => {
                        try {
                            const loanDetails = await contract.getLoanDetails(loanId)
                            const harvestToken = await contract.harvestTokens(loanDetails.harvestTokenId)
                            const investments = await contract.getLoanInvestments(loanId)
                            const totalFunded = investments.reduce((sum: bigint, inv: any) => sum + inv.amount, BigInt(0))

                            return {
                                id: Number(loanId),
                                cropType: harvestToken.cropType,
                                requestedAmount: ethers.formatEther(loanDetails.requestedAmount),
                                fundedAmount: ethers.formatEther(totalFunded),
                                interestRate: Number(loanDetails.interestRate),
                                duration: Number(loanDetails.duration),
                                status: Number(loanDetails.status),
                                txHash: 'blockchain',
                                isOnChain: true
                            }
                        } catch (error) {
                            console.error('Error loading loan:', error)
                            return null
                        }
                    }))

                    const validLoans = farmerLoans.filter(loan => loan !== null)
                    setBlockchainLoans(validLoans)
                } catch (error) {
                    console.error('Error reloading loans:', error)
                }
            }

            await loadBlockchainLoans()
        } catch (error: any) {
            console.error('Error repaying loan:', error)
            const errorMsg = error.reason || error.message || 'Failed to repay loan'
            toast.error(`Repayment failed: ${errorMsg}`)
        } finally {
            setRepayingLoans(prev => {
                const newSet = new Set(prev)
                newSet.delete(loanId)
                return newSet
            })
        }
    }

    // Use only blockchain loans (fresh data from contract)
    const allLoans = blockchainLoans

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
                        const progress = (parseFloat(loan.fundedAmount) / parseFloat(loan.requestedAmount)) * 100
                        return (
                            <div key={loan.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                            <Sprout className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold mb-0.5">{loan.cropType} Harvest</h3>
                                            <p className="text-xs text-gray-600">Loan #{loan.id}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${loan.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        loan.status === 1 ? 'bg-blue-100 text-blue-800' :
                                            loan.status === 2 ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {loan.status === 0 ? '⏳ Pending' : loan.status === 1 ? '✅ Funded' : loan.status === 2 ? '🎉 Repaid' : 'Active'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Requested</p>
                                        <p className="text-base font-bold">{formatHBARNumber(loan.requestedAmount)} HBAR</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Funded</p>
                                        <p className="text-base font-bold text-green-600">{formatHBARNumber(loan.fundedAmount)} HBAR</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Interest</p>
                                        <p className="text-base font-bold">{(loan.interestRate / 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Duration</p>
                                        <p className="text-base font-bold">{loan.duration} days</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-gray-600 font-medium">Funding Progress</span>
                                        <span className="font-bold text-primary-600">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        {formatHBARNumber(loan.fundedAmount)} / {formatHBARNumber(loan.requestedAmount)} HBAR funded
                                    </p>
                                </div>
                                {/* Repayment Section */}
                                {loan.status === 1 && ( // Status = Funded
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="mb-2">
                                            <p className="text-xs font-semibold text-blue-900 mb-1">Ready to Repay</p>
                                            <p className="text-xs text-blue-700">
                                                Principal: {formatHBARNumber(loan.requestedAmount)} HBAR
                                                {' + '}
                                                Interest: {formatHBARNumber((parseFloat(loan.requestedAmount) * loan.interestRate / 10000).toString())} HBAR
                                                {' = '}
                                                <span className="font-bold">
                                                    {formatHBARNumber((parseFloat(loan.requestedAmount) * (1 + loan.interestRate / 10000)).toString())} HBAR
                                                </span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRepayLoan(loan.id, loan)}
                                            disabled={repayingLoans.has(loan.id)}
                                            className={`w-full btn-primary text-sm py-2 flex items-center justify-center gap-2 ${
                                                repayingLoans.has(loan.id) 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : ''
                                            }`}
                                        >
                                            {repayingLoans.has(loan.id) ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Repaying...
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="w-4 h-4" />
                                                    Repay Loan ({formatHBARNumber((parseFloat(loan.requestedAmount) * (1 + loan.interestRate / 10000)).toString())} HBAR)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {loan.status === 2 && ( // Status = Repaid
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <div>
                                                <p className="text-xs font-semibold text-green-900">Loan Repaid</p>
                                                <p className="text-xs text-green-700">Your NFT collateral has been unlocked</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Blockchain Verification */}
                                {loan.isOnChain && loan.txHash && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
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
