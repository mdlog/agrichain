'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, TrendingUp, Clock, Calendar, User, Sprout, AlertCircle, Wallet } from 'lucide-react'
import { mockLoans, calculateProgress } from '@/lib/mockData'
import { useWallet } from '@/context/WalletContext'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { hbarToWei, weiToHBAR, validateHBARAmount, debugHBARTransaction, formatHBARNumber } from '@/lib/hbarUtils'

export default function LoanDetail() {
    const params = useParams()
    const router = useRouter()
    const { account, connectWallet, signer, provider } = useWallet()
    const [loan, setLoan] = useState<any>(null)
    const [investAmount, setInvestAmount] = useState('')
    const [loading, setLoading] = useState(true)
    const [isInvesting, setIsInvesting] = useState(false)

    useEffect(() => {
        const loadLoan = async () => {
            const loanId = parseInt(params.id as string)

            try {
                if (provider) {
                    const contract = getContract(provider)
                    const loanDetails = await contract.getLoanDetails(loanId)
                    const investments = await contract.getLoanInvestments(loanId)
                    const harvestToken = await contract.harvestTokens(loanDetails.harvestTokenId)

                    // Calculate total funded amount
                    const totalFunded = investments.reduce((sum: bigint, inv: any) => sum + inv.amount, BigInt(0))

                    setLoan({
                        id: loanId,
                        farmer: loanDetails.farmer,
                        farmerName: 'Farmer',
                        cropType: harvestToken.cropType,
                        requestedAmount: ethers.formatEther(loanDetails.requestedAmount), // Convert from wei to HBAR
                        fundedAmount: ethers.formatEther(totalFunded), // Convert from wei to HBAR
                        interestRate: Number(loanDetails.interestRate),
                        duration: Number(loanDetails.duration),
                        status: Number(loanDetails.status),
                        expectedYield: Number(harvestToken.expectedYield),
                        harvestDate: Number(harvestToken.harvestDate),
                        collateralValue: ethers.formatEther(harvestToken.estimatedValue) // Convert from wei to HBAR
                    })
                    setLoading(false)
                    return
                }
            } catch (error) {
                console.error('Error loading loan from blockchain:', error)
            }

            // Fallback to localStorage/mock
            let foundLoan = null

            if (typeof window !== 'undefined') {
                const savedLoans = localStorage.getItem('marketplaceLoans')
                if (savedLoans) {
                    try {
                        const parsedLoans = JSON.parse(savedLoans)
                        foundLoan = parsedLoans.find((l: any) => l.id === loanId)
                    } catch (e) {
                        console.error('Error parsing saved loans:', e)
                    }
                }
            }

            if (!foundLoan) {
                foundLoan = mockLoans.find(l => l.id === loanId)
            }

            if (foundLoan) {
                setLoan(foundLoan)
            }
            setLoading(false)
        }

        loadLoan()
    }, [params.id, provider])

    const handleInvest = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!account || !signer) {
            toast.error('Please connect your wallet first')
            return
        }

        const amount = parseFloat(investAmount)

        // Validate amount using utility function
        const validationError = validateHBARAmount(amount, 0.01, 1000000)
        if (validationError) {
            toast.error(validationError)
            return
        }

        const remaining = parseFloat(loan.requestedAmount) - parseFloat(loan.fundedAmount)
        if (amount > remaining) {
            toast.error(`Maximum investment amount is ${formatHBARNumber(remaining)} HBAR`)
            return
        }

        setIsInvesting(true)

        try {
            const contract = getContract(signer)
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

            if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                throw new Error('Contract not deployed')
            }

            const loadingToast = toast.loading('Processing investment on blockchain...')

            // Convert HBAR to wei using utility function (Hedera EVM uses standard wei - 18 decimals)
            const amountInWei = hbarToWei(amount)

            // Debug logging using utility function
            debugHBARTransaction('Investment Transaction', amount, amountInWei)
            console.log('Loan ID:', loan.id)
            console.log('Contract address:', contract.target)

            // Call investInLoan with HBAR value (in wei)
            const tx = await contract.investInLoan(loan.id, { value: amountInWei })

            console.log('Transaction sent:', tx.hash)
            console.log('Transaction value:', tx.value?.toString() || 'undefined')

            toast.dismiss(loadingToast)
            const successToast = toast.loading('Waiting for confirmation...')

            const receipt = await tx.wait()

            toast.dismiss(successToast)
            toast.success(`Successfully invested ${formatHBARNumber(amount)} HBAR!`, {
                duration: 5000
            })

            // Refresh loan data
            router.refresh()

            // Show transaction hash
            const txHash = receipt.hash
            toast.success(
                <div>
                    Investment confirmed!{' '}
                    <a
                        href={`https://hashscan.io/testnet/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        View on HashScan
                    </a>
                </div>,
                { duration: 8000 }
            )

            setInvestAmount('')

        } catch (error: any) {
            console.error('Error investing:', error)

            let errorMessage = 'Failed to invest on blockchain'

            if (error.message?.includes('RPC endpoint returned HTTP client error') ||
                error.message?.includes('RPC Error')) {
                errorMessage = 'Hedera Testnet is experiencing issues. Please try again in a few moments.'
                toast.error(errorMessage, { duration: 8000 })
            } else if (error.message?.includes('revert')) {
                errorMessage = error.message.split('revert ')[1] || errorMessage
                toast.error(errorMessage)
            } else if (error.message) {
                errorMessage = error.message
                toast.error(errorMessage)
            } else {
                toast.error('Transaction failed. Please try again.')
            }
        } finally {
            setIsInvesting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!loan) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Loan Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        The loan you're looking for doesn't exist or has been removed.
                    </p>
                    <Link href="/marketplace" className="btn-primary">
                        Back to Marketplace
                    </Link>
                </div>
            </div>
        )
    }

    const progress = calculateProgress(loan.fundedAmount, loan.requestedAmount)
    const remaining = parseFloat(loan.requestedAmount) - parseFloat(loan.fundedAmount)
    
    // Calculate interest rate percentage (same logic as marketplace)
    // Handle different interest rate formats
    // If > 100, it's in basis points (500 = 5%)
    // If < 100, it's already in percentage (5 = 5%)
    const interestRatePercent = loan.interestRate > 100
        ? loan.interestRate / 100
        : loan.interestRate
    
    const interestAmount = (parseFloat(loan.requestedAmount) * interestRatePercent) / 100
    const totalRepayment = parseFloat(loan.requestedAmount) + interestAmount
    const harvestDate = new Date(loan.harvestDate * 1000)
    const daysUntilHarvest = Math.ceil((loan.harvestDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24))

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Marketplace
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Loan Header */}
                        <div className="card">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">🌾 {loan.cropType} Harvest Loan</h1>
                                    <p className="text-gray-600">Loan #{loan.id}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${loan.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    loan.status === 1 ? 'bg-green-100 text-green-800' :
                                        loan.status === 2 ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {loan.status === 0 ? 'Active' : loan.status === 1 ? 'Funded' : loan.status === 2 ? 'Repaid' : 'Unknown'}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Funding Progress</span>
                                    <span className="font-bold">{progress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className="bg-primary-600 h-4 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-gray-600">{loan.fundedAmount} HBAR funded</span>
                                    <span className="text-gray-600">{remaining.toFixed(2)} HBAR remaining</span>
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatBox
                                    icon={<DollarSign className="w-5 h-5" />}
                                    label="Loan Amount"
                                    value={`${loan.requestedAmount} HBAR`}
                                />
                                <StatBox
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    label="Interest Rate"
                                    value={`${interestRatePercent.toFixed(1)}%`}
                                    highlight
                                />
                                <StatBox
                                    icon={<Clock className="w-5 h-5" />}
                                    label="Duration"
                                    value={`${loan.duration} days`}
                                />
                                <StatBox
                                    icon={<Calendar className="w-5 h-5" />}
                                    label="Harvest Date"
                                    value={harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                            </div>
                        </div>

                        {/* Loan Details */}
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Loan Details</h2>
                            <div className="space-y-4">
                                <DetailRow label="Farmer" value={loan.farmerName || 'Anonymous Farmer'} />
                                <DetailRow label="Farmer Address" value={`${loan.farmer.slice(0, 10)}...${loan.farmer.slice(-8)}`} mono />
                                <DetailRow label="Crop Type" value={loan.cropType} />
                                <DetailRow label="Expected Yield" value={`${loan.expectedYield.toLocaleString()} kg`} />
                                <DetailRow label="Collateral Value" value={`${loan.collateralValue} HBAR`} />
                                <DetailRow label="Loan-to-Value" value={`${((parseFloat(loan.requestedAmount) / parseFloat(loan.collateralValue)) * 100).toFixed(1)}%`} />
                                <DetailRow label="Days Until Harvest" value={`${daysUntilHarvest} days`} />
                            </div>
                        </div>

                        {/* Returns Calculation */}
                        <div className="card bg-primary-50 border-primary-200">
                            <h2 className="text-2xl font-bold mb-4">Investment Returns</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Principal</span>
                                    <span className="font-bold">{loan.requestedAmount} HBAR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Interest ({interestRatePercent.toFixed(1)}%)</span>
                                    <span className="font-bold text-green-600">+{interestAmount.toFixed(2)} HBAR</span>
                                </div>
                                <div className="border-t border-primary-300 pt-3 flex justify-between">
                                    <span className="text-lg font-bold">Total Repayment</span>
                                    <span className="text-lg font-bold text-primary-600">{totalRepayment.toFixed(2)} HBAR</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-4">
                                    If you invest 100 HBAR, you'll receive {(100 * (1 + interestRatePercent / 100)).toFixed(2)} HBAR after {loan.duration} days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Investment Form */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold mb-2">Invest in This Loan</h2>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-primary-50 p-3 rounded-lg">
                                    <Wallet className="w-4 h-4 text-primary-600" />
                                    <span>Pay with <strong>HBAR</strong> cryptocurrency</span>
                                </div>
                            </div>

                            {loan.status === 0 ? (
                                <>
                                    {account ? (
                                        <form onSubmit={handleInvest} className="space-y-4">
                                            <div>
                                                <label className="label">Investment Amount (HBAR)</label>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    placeholder="Enter amount in HBAR (e.g., 10)"
                                                    value={investAmount}
                                                    onChange={(e) => setInvestAmount(e.target.value)}
                                                    min="0.01"
                                                    max={remaining > 0 ? remaining : 1000000}
                                                    step="0.01"
                                                    required
                                                    disabled={isInvesting}
                                                />
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-xs text-gray-500">
                                                        Min: 0.01 HBAR | Max: {formatHBARNumber(remaining)} HBAR
                                                    </p>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        💡 Enter amount in HBAR (not wei). Example: 10 for ten HBAR
                                                    </p>
                                                </div>
                                            </div>

                                            {investAmount && parseFloat(investAmount) > 0 && (
                                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>You invest</span>
                                                        <span className="font-bold">{parseFloat(investAmount).toFixed(2)} HBAR</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>You receive</span>
                                                        <span className="font-bold text-green-600">
                                                            {(parseFloat(investAmount) * (1 + interestRatePercent / 100)).toFixed(2)} HBAR
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Profit</span>
                                                        <span className="font-bold text-green-600">
                                                            +{(parseFloat(investAmount) * interestRatePercent / 100).toFixed(2)} HBAR
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="btn-primary w-full"
                                                disabled={isInvesting}
                                            >
                                                {isInvesting ? 'Processing...' : (
                                                    <>
                                                        <Wallet className="w-4 h-4 inline mr-2" />
                                                        Invest with HBAR
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-6">
                                            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-4">
                                                Connect your wallet to invest in this loan
                                            </p>
                                            <button onClick={connectWallet} className="btn-primary w-full">
                                                Connect Wallet
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : loan.status === 1 ? (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-gray-600 mb-2">This loan is fully funded</p>
                                    <p className="text-sm text-gray-500">
                                        Waiting for harvest and repayment
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-600">This loan is no longer available</p>
                                </div>
                            )}

                            {/* Risk Warning */}
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800 mb-1">Investment Risk</p>
                                        <p className="text-xs text-yellow-700">
                                            Agricultural loans carry risks including crop failure, weather events, and market price fluctuations. Only invest what you can afford to lose.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBox({ icon, label, value, highlight }: {
    icon: React.ReactNode
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <div className={`flex items-center gap-2 mb-2 ${highlight ? 'text-green-600' : 'text-gray-400'}`}>
                {icon}
            </div>
            <p className="text-xs text-gray-600 mb-1">{label}</p>
            <p className={`text-lg font-bold ${highlight ? 'text-green-600' : ''}`}>{value}</p>
        </div>
    )
}

function DetailRow({ label, value, mono }: { label: string, value: string, mono?: boolean }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-600">{label}</span>
            <span className={`font-medium ${mono ? 'font-mono text-sm' : ''}`}>{value}</span>
        </div>
    )
}
