'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, TrendingUp, Clock, DollarSign, ChevronLeft, ChevronRight, ExternalLink, Timer } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWallet } from '@/context/WalletContext'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'

interface Loan {
    id: number
    farmer: string
    cropType: string
    requestedAmount: string
    interestRate: number
    duration: number
    fundedAmount: string
    status: number
    createdAt?: number // Timestamp in seconds
    txHash?: string // Transaction hash from blockchain
    isOnChain?: boolean // Flag to identify blockchain loans
}

const LOANS_PER_PAGE = 9

export default function Marketplace() {
    const { provider, isConnected, isConnecting } = useWallet()
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [blockchainLoans, setBlockchainLoans] = useState<Loan[]>([])
    const [debugInfo, setDebugInfo] = useState<{
        contractAddress?: string
        eventsFound?: number
        loansLoaded?: number
        currentBlock?: number
        blockRange?: number
        networkId?: number
        error?: string
    }>({})
    const [showDebug, setShowDebug] = useState(false)
    const [hasShownWalletError, setHasShownWalletError] = useState(false)

    useEffect(() => {
        // Only load loans if wallet is connected or if we're still connecting
        // Don't show error if wallet is still connecting
        if (isConnecting) {
            return // Wait for connection to complete
        }

        if (isConnected && provider) {
            // Reset error flag when wallet connects
            setHasShownWalletError(false)
            loadLoans()
        } else if (!isConnected && !isConnecting) {
            // Only show error if wallet is definitely not connected
            setLoading(false)
            setLoans([])
        }

        // Listen for storage changes to auto-refresh
        const handleStorageChange = () => {
            if (isConnected && provider) {
                console.log('Storage change detected, reloading loans...')
                loadLoans()
            }
        }

        // Listen for custom events
        window.addEventListener('loanCreated', handleStorageChange)
        window.addEventListener('loanUpdated', handleStorageChange)
        window.addEventListener('storage', handleStorageChange)

        // Also listen for focus event to refresh when user comes back to tab
        const handleFocus = () => {
            if (isConnected && provider) {
                console.log('Page focused, reloading loans...')
                loadLoans()
            }
        }
        window.addEventListener('focus', handleFocus)

        return () => {
            window.removeEventListener('loanCreated', handleStorageChange)
            window.removeEventListener('loanUpdated', handleStorageChange)
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('focus', handleFocus)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, isConnected, isConnecting]) // loadLoans is stable and checks wallet state internally

    const loadLoans = async () => {
        // Don't load if wallet is not connected
        if (!isConnected || !provider) {
            console.log('⏸️ Skipping loadLoans - wallet not connected')
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            // Load loans from blockchain
            const onChainLoans = await loadLoansFromBlockchain()

            // All loans from contract are valid (no need to filter by txHash anymore)
            // We're loading directly from contract state, not from events
            const validBlockchainLoans = onChainLoans.filter(loan => loan.isOnChain)

            setLoans(validBlockchainLoans)
            setBlockchainLoans(validBlockchainLoans)

            // Update debug info with final result
            setDebugInfo(prev => ({
                ...prev,
                loansLoaded: validBlockchainLoans.length
            }))

            console.log('📋 Final Result:')
            console.log('   Total loans loaded:', validBlockchainLoans.length)
            console.log('   Loans with details:', validBlockchainLoans.map(l => ({
                id: l.id,
                cropType: l.cropType,
                requestedAmount: l.requestedAmount,
                fundedAmount: l.fundedAmount,
                status: l.status,
                txHash: l.txHash?.slice(0, 10) + '...' + l.txHash?.slice(-8)
            })))

            if (validBlockchainLoans.length === 0 && onChainLoans.length > 0) {
                console.warn('⚠️ Some loans were filtered out (missing txHash or isOnChain flag)')
                console.log('   Total loans found:', onChainLoans.length)
                console.log('   Valid loans:', validBlockchainLoans.length)
                setDebugInfo(prev => ({
                    ...prev,
                    error: `${onChainLoans.length} loans found but filtered out (missing txHash or isOnChain flag)`
                }))
            }
        } catch (error: any) {
            console.error('Error loading loans:', error)
            const errorMsg = error.message || 'Failed to load loans from blockchain'
            toast.error(errorMsg)
            setDebugInfo(prev => ({
                ...prev,
                error: errorMsg
            }))
            setLoans([]) // Show empty if blockchain fails
        } finally {
            setLoading(false)
        }
    }

    const loadLoansFromBlockchain = async (): Promise<Loan[]> => {
        try {
            if (!provider) {
                console.warn('⚠️ No provider available - wallet not connected')
                if (!isConnected && !isConnecting && !hasShownWalletError) {
                    setHasShownWalletError(true)
                }
                return []
            }

            const contract = getContract(provider)
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

            console.log('📋 Contract Address:', contractAddress)

            if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                console.error('❌ Contract not deployed')
                toast.error('Contract not deployed')
                return []
            }

            // ✅ NEW APPROACH: Direct contract calls (135x faster!)
            // Instead of querying events from millions of blocks,
            // we directly call contract functions to get loan data
            console.log('🔍 Getting loan count from contract...')

            const loanCount = await contract.loanRequestCounter()
            const totalLoans = Number(loanCount)

            console.log(`✅ Found ${totalLoans} loans in contract`)

            // Update debug info
            const network = await provider.getNetwork()
            setDebugInfo({
                contractAddress,
                loansLoaded: totalLoans,
                networkId: Number(network.chainId)
            })

            if (totalLoans === 0) {
                console.warn('⚠️ No loans found in contract')
                toast.error('No loans found. Create your first loan!', { duration: 5000 })
                return []
            }

            // Load all loan details in parallel
            console.log(`📊 Loading details for ${totalLoans} loans...`)
            const loanPromises: Promise<Loan | null>[] = []

            for (let loanId = 0; loanId < totalLoans; loanId++) {
                loanPromises.push(
                    (async () => {
                        try {
                            console.log(`   Loading loan #${loanId}...`)

                            // Get loan details
                            const loanDetails = await contract.getLoanDetails(loanId)

                            // Get investments for this loan
                            const investments = await contract.getLoanInvestments(loanId)

                            // Calculate total funded amount
                            const totalFunded = investments.reduce(
                                (sum: bigint, inv: any) => sum + inv.amount,
                                BigInt(0)
                            )

                            // Get crop type from harvest token
                            const harvestToken = await contract.harvestTokens(
                                loanDetails.harvestTokenId.toString()
                            )

                            // Format amounts to HBAR
                            const requestedAmountHBAR = ethers.formatEther(loanDetails.requestedAmount)
                            const fundedAmountHBAR = ethers.formatEther(totalFunded)

                            console.log(`   ✅ Loan #${loanId}: ${harvestToken.cropType} - ${requestedAmountHBAR} HBAR requested, ${fundedAmountHBAR} HBAR funded`)

                            return {
                                id: loanId,
                                farmer: loanDetails.farmer,
                                cropType: harvestToken.cropType,
                                requestedAmount: requestedAmountHBAR,
                                interestRate: Number(loanDetails.interestRate),
                                duration: Number(loanDetails.duration),
                                fundedAmount: fundedAmountHBAR,
                                status: Number(loanDetails.status),
                                createdAt: Number(loanDetails.createdAt),
                                txHash: '', // Not needed for this approach
                                isOnChain: true
                            } as Loan
                        } catch (error) {
                            console.error(`   ❌ Error loading loan #${loanId}:`, error)
                            return null
                        }
                    })()
                )
            }

            // Wait for all loans to load
            const loans = (await Promise.all(loanPromises))
                .filter((loan): loan is Loan => loan !== null)

            console.log(`✅ Successfully loaded ${loans.length} loans`)
            console.log('📋 Loans:', loans.map(l => ({
                id: l.id,
                cropType: l.cropType,
                requested: l.requestedAmount,
                funded: l.fundedAmount,
                status: l.status
            })))

            return loans

        } catch (error) {
            console.error('Error loading loans from blockchain:', error)
            return []
        }
    }

    const filteredLoans = loans.filter(loan => {
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && loan.status === 0) ||
            (filter === 'funded' && loan.status === 1)

        const matchesSearch = loan.cropType.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesFilter && matchesSearch
    })

    // Pagination calculations
    const totalPages = Math.ceil(filteredLoans.length / LOANS_PER_PAGE)
    const startIndex = (currentPage - 1) * LOANS_PER_PAGE
    const endIndex = startIndex + LOANS_PER_PAGE
    const currentLoans = filteredLoans.slice(startIndex, endIndex)

    // Reset to page 1 when filter/search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filter, searchTerm])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Loan Marketplace</h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                Browse and invest in agricultural loans verified on Hedera Testnet
                            </p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            <button
                                onClick={() => loadLoans()}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                            >
                                🔄 Refresh
                            </button>
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                {showDebug ? '🔍 Hide Debug' : '🔍 Debug Info'}
                            </button>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">
                                    {blockchainLoans.length} On-Chain Loans
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Panel */}
                {showDebug && (
                    <div className="card mb-6 bg-blue-50 border-blue-200">
                        <h3 className="font-bold mb-3 text-blue-900">🔍 Debug Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Contract Address:</span>
                                <span className="ml-2 font-mono text-xs break-all">{debugInfo.contractAddress || 'Not set'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Network:</span>
                                <span className="ml-2">{debugInfo.networkId === 296 ? '✅ Hedera Testnet (296)' : `⚠️ ${debugInfo.networkId || 'Unknown'}`}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Current Block:</span>
                                <span className="ml-2">{debugInfo.currentBlock?.toLocaleString() || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Block Range:</span>
                                <span className="ml-2">{debugInfo.blockRange?.toLocaleString() || 'N/A'} blocks</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Events Found:</span>
                                <span className="ml-2 font-bold">{debugInfo.eventsFound ?? 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Loans Loaded:</span>
                                <span className="ml-2 font-bold">{debugInfo.loansLoaded ?? 'N/A'}</span>
                            </div>
                            {debugInfo.error && (
                                <div className="col-span-2">
                                    <span className="font-medium text-red-700">Error:</span>
                                    <span className="ml-2 text-red-600">{debugInfo.error}</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                            <p>💡 <strong>Tips:</strong></p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Check browser console (F12) for detailed logs</li>
                                <li>Ensure wallet is connected to Hedera Testnet</li>
                                <li>Verify contract address matches deployed contract</li>
                                <li>Loans must have valid txHash to appear</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="card mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by crop type..."
                                className="input pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('active')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${filter === 'active'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('funded')}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${filter === 'funded'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Funded
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loans Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading loans from blockchain...</p>
                        <p className="mt-2 text-sm text-gray-500">Please ensure your wallet is connected</p>
                    </div>
                ) : isConnecting ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Connecting wallet...</p>
                    </div>
                ) : !isConnected || !provider ? (
                    <div className="text-center py-12">
                        <div className="mb-4 text-6xl">🔌</div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">Wallet Not Connected</p>
                        <p className="text-gray-600 mb-4">Please connect your wallet to view loans from the blockchain</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Refresh Page
                        </button>
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mb-4 text-6xl">📭</div>
                        <p className="text-xl font-semibold text-gray-800 mb-2">No Loans Found</p>
                        <p className="text-gray-600 mb-4">
                            {loans.length === 0
                                ? 'No loans have been created on the blockchain yet'
                                : 'No loans match your current filters'
                            }
                        </p>
                        {loans.length === 0 && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto text-left">
                                <p className="text-sm text-blue-800 font-semibold mb-2">💡 Troubleshooting Tips:</p>
                                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Check browser console for detailed logs</li>
                                    <li>Verify contract address in .env.local</li>
                                    <li>Ensure loans were created on the same network (testnet)</li>
                                    <li>Try creating a new loan from the Farmer page</li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Loans Count Info */}
                        <div className="mb-4 text-sm text-gray-600">
                            Showing {currentLoans.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans
                        </div>

                        {/* Loans Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentLoans.map((loan) => (
                                <LoanCard key={loan.id} loan={loan} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function LoanCard({ loan }: { loan: Loan }) {
    // Calculate progress percentage, cap at 100%
    const funded = parseFloat(loan.fundedAmount)
    const requested = parseFloat(loan.requestedAmount)
    const progress = requested > 0 ? Math.min((funded / requested) * 100, 100) : 0

    // Countdown timer state
    const [timeRemaining, setTimeRemaining] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
        expired: boolean
    } | null>(null)

    // Calculate time remaining
    useEffect(() => {
        if (!loan.createdAt || !loan.duration) {
            setTimeRemaining(null)
            return
        }

        const calculateTimeRemaining = () => {
            const now = Math.floor(Date.now() / 1000) // Current time in seconds
            const createdAt = loan.createdAt!
            const durationSeconds = loan.duration * 24 * 60 * 60 // Convert days to seconds
            const deadline = createdAt + durationSeconds
            const remaining = deadline - now

            if (remaining <= 0) {
                setTimeRemaining({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    expired: true
                })
                return
            }

            const days = Math.floor(remaining / (24 * 60 * 60))
            const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
            const minutes = Math.floor((remaining % (60 * 60)) / 60)
            const seconds = remaining % 60

            setTimeRemaining({
                days,
                hours,
                minutes,
                seconds,
                expired: false
            })
        }

        // Calculate immediately
        calculateTimeRemaining()

        // Update every second
        const interval = setInterval(calculateTimeRemaining, 1000)

        return () => clearInterval(interval)
    }, [loan.createdAt, loan.duration])

    // Debug logging for each loan card (only log once on mount)
    // Removed to prevent console spam - was causing performance issues

    return (
        <div className="card hover:shadow-xl transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold mb-1">🌾 {loan.cropType}</h3>
                    <p className="text-sm text-gray-500">Loan #{loan.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                    loan.status === 1 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {loan.status === 0 ? 'Active' : loan.status === 1 ? 'Funded' : 'Repaid'}
                </span>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold">{loan.requestedAmount} HBAR</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-bold text-green-600">
                        {(() => {
                            // Handle different interest rate formats
                            // If > 100, it's in basis points (500 = 5%)
                            // If < 100, it's already in percentage (5 = 5%)
                            const rate = loan.interestRate > 100
                                ? loan.interestRate / 100
                                : loan.interestRate
                            return rate.toFixed(1)
                        })()}%
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-bold">{loan.duration} days</span>
                </div>
            </div>

            {/* Countdown Timer */}
            {timeRemaining !== null && loan.status === 0 && (
                <div className={`mb-4 p-3 rounded-lg border ${timeRemaining.expired
                    ? 'bg-red-50 border-red-200'
                    : timeRemaining.days < 3
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Timer className={`w-4 h-4 ${timeRemaining.expired
                                ? 'text-red-600'
                                : timeRemaining.days < 3
                                    ? 'text-yellow-600'
                                    : 'text-blue-600'
                                }`} />
                            <span className={`text-xs font-medium ${timeRemaining.expired
                                ? 'text-red-700'
                                : timeRemaining.days < 3
                                    ? 'text-yellow-700'
                                    : 'text-gray-700'
                                }`}>
                                {timeRemaining.expired ? 'Expired' : 'Time Remaining:'}
                            </span>
                        </div>
                        {timeRemaining.expired ? (
                            <span className="text-xs font-bold text-red-600 animate-pulse">EXPIRED</span>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                {timeRemaining.days > 0 && (
                                    <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded border border-blue-200">
                                        <span className={`text-sm font-bold ${timeRemaining.days < 3 ? 'text-yellow-600' : 'text-blue-600'
                                            }`}>
                                            {timeRemaining.days}
                                        </span>
                                        <span className="text-xs text-gray-600">d</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded border border-blue-200">
                                    <span className={`text-sm font-bold ${timeRemaining.days < 3 ? 'text-yellow-600' : 'text-blue-600'
                                        }`}>
                                        {String(timeRemaining.hours).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs text-gray-600">h</span>
                                </div>
                                <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded border border-blue-200">
                                    <span className={`text-sm font-bold ${timeRemaining.days < 3 ? 'text-yellow-600' : 'text-blue-600'
                                        }`}>
                                        {String(timeRemaining.minutes).padStart(2, '0')}
                                    </span>
                                    <span className="text-xs text-gray-600">m</span>
                                </div>
                                {timeRemaining.days < 7 && (
                                    <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded border border-blue-200">
                                        <span className={`text-sm font-bold ${timeRemaining.days < 3 ? 'text-yellow-600' : 'text-blue-600'
                                            }`}>
                                            {String(timeRemaining.seconds).padStart(2, '0')}
                                        </span>
                                        <span className="text-xs text-gray-600">s</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {timeRemaining.expired && (
                        <p className="text-xs text-red-600 mt-2 font-medium">⚠️ This loan has expired and may be closed soon.</p>
                    )}
                    {!timeRemaining.expired && timeRemaining.days < 3 && (
                        <p className="text-xs text-yellow-700 mt-2 font-medium">
                            ⚠️ Only {timeRemaining.days} day{timeRemaining.days !== 1 ? 's' : ''} remaining!
                        </p>
                    )}
                </div>
            )}

            {/* Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Funded</span>
                    <span className="font-bold">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(loan.fundedAmount).toFixed(8)} / {loan.requestedAmount} HBAR
                </p>
            </div>

            {/* Farmer */}
            <div className="text-xs sm:text-sm text-gray-600 mb-4 overflow-hidden">
                <span className="block sm:inline">Farmer: </span>
                <span className="font-mono text-xs break-all">{loan.farmer.slice(0, 10)}...{loan.farmer.slice(-8)}</span>
            </div>

            {/* Blockchain Verification */}
            {loan.isOnChain && loan.txHash && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium text-green-800">On-Chain Verified</span>
                        </div>
                        <a
                            href={`https://hashscan.io/testnet/tx/${loan.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                        >
                            View Tx
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            )}

            {/* Action */}
            <Link
                href={`/loan/${loan.id}`}
                className="btn-primary w-full text-center block"
            >
                View Details
            </Link>
        </div>
    )
}

function PaginationControls({ currentPage, totalPages, onPageChange }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}) {
    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than maxVisible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show pages with ellipsis
            if (currentPage <= 3) {
                // Near the start
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push(-1) // Ellipsis
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push(1)
                pages.push(-1) // Ellipsis
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                // In the middle
                pages.push(1)
                pages.push(-1) // Ellipsis
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push(-1) // Ellipsis
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
                {getPageNumbers().map((page, index) => (
                    page === -1 ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition ${page === currentPage
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}
