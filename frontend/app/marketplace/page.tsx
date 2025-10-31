'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, TrendingUp, Clock, DollarSign, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
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
    txHash?: string // Transaction hash from blockchain
    isOnChain?: boolean // Flag to identify blockchain loans
}

const LOANS_PER_PAGE = 9

export default function Marketplace() {
    const { provider } = useWallet()
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [blockchainLoans, setBlockchainLoans] = useState<Loan[]>([])

    useEffect(() => {
        loadLoans()

        // Listen for storage changes to auto-refresh
        const handleStorageChange = () => {
            console.log('Storage change detected, reloading loans...')
            loadLoans()
        }

        // Listen for custom events
        window.addEventListener('loanCreated', handleStorageChange)
        window.addEventListener('loanUpdated', handleStorageChange)
        window.addEventListener('storage', handleStorageChange)

        // Also listen for focus event to refresh when user comes back to tab
        window.addEventListener('focus', () => {
            console.log('Page focused, reloading loans...')
            loadLoans()
        })

        return () => {
            window.removeEventListener('loanCreated', handleStorageChange)
            window.removeEventListener('loanUpdated', handleStorageChange)
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('focus', () => loadLoans())
        }
    }, [provider]) // Add provider as dependency to re-run when wallet connects

    const loadLoans = async () => {
        try {
            setLoading(true)

            // Load loans from blockchain
            const onChainLoans = await loadLoansFromBlockchain()

            // Filter to show ONLY on-chain loans with tx hash
            const validBlockchainLoans = onChainLoans.filter(loan => loan.isOnChain && loan.txHash)

            setLoans(validBlockchainLoans)
            setBlockchainLoans(validBlockchainLoans)

            console.log('Loaded loans from blockchain:', validBlockchainLoans.length)
        } catch (error) {
            console.error('Error loading loans:', error)
            toast.error('Failed to load loans from blockchain')
            setLoans([]) // Show empty if blockchain fails
        } finally {
            setLoading(false)
        }
    }

    const loadLoansFromBlockchain = async (): Promise<Loan[]> => {
        try {
            if (!provider) {
                console.log('No provider available, skipping blockchain load')
                return []
            }

            const contract = getContract(provider)
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

            if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                console.log('Contract not deployed, skipping blockchain load')
                return []
            }

            // Query LoanRequested events - use 'latest' to get all blocks
            const eventFilter = contract.filters.LoanRequested()

            // Try to get events with a recent block range first for performance
            const currentBlock = await provider.getBlockNumber()
            const fromBlock = Math.max(0, currentBlock - 5000) // Last 5000 blocks
            const toBlock = 'latest'

            console.log('Querying LoanRequested events from block', fromBlock, 'to', toBlock)
            const events = await contract.queryFilter(eventFilter, fromBlock, toBlock)

            console.log('Found LoanRequested events:', events.length)

            // Also query LoanFunded events to see all investments
            const fundedEventFilter = contract.filters.LoanFunded()
            const fundedEvents = await contract.queryFilter(fundedEventFilter, fromBlock, toBlock)
            console.log('Found LoanFunded events:', fundedEvents.length)
            fundedEvents.forEach((event: any) => {
                console.log(`  LoanFunded event:`, {
                    loanId: event.args[0].toString(),
                    investor: event.args[1],
                    amount: event.args[2].toString(),
                    amountHBAR: ethers.formatEther(event.args[2]),
                    txHash: event.transactionHash,
                    blockNumber: event.blockNumber
                })
            })

            // Fetch loan details for each event
            const loanPromises = events.map(async (event: any) => {
                try {
                    const loanId = event.args[0].toString()

                    // Get transaction hash
                    const txHash = event.transactionHash

                    // Get loan details
                    const loanDetails = await contract.getLoanDetails(loanId)
                    const investments = await contract.getLoanInvestments(loanId)

                    // Calculate total funded amount
                    const totalFunded = investments.reduce((sum: bigint, inv: any) => sum + inv.amount, BigInt(0))

                    // Debug: Compare storage vs events
                    console.log(`=== Storage vs Events Comparison for Loan ${loanId} ===`)
                    console.log('Storage investments count:', investments.length)
                    investments.forEach((inv: any, index: number) => {
                        console.log(`  Storage Investment ${index + 1}:`, {
                            investor: inv.investor,
                            amount: inv.amount.toString(),
                            amountHBAR: ethers.formatEther(inv.amount),
                            investedAt: new Date(Number(inv.investedAt) * 1000).toISOString()
                        })
                    })

                    // Find matching events for this loan
                    const loanFundedEvents = fundedEvents.filter((event: any) => event.args[0].toString() === loanId.toString())
                    console.log('Event investments count:', loanFundedEvents.length)
                    loanFundedEvents.forEach((event: any, index: number) => {
                        console.log(`  Event Investment ${index + 1}:`, {
                            investor: event.args[1],
                            amount: event.args[2].toString(),
                            amountHBAR: ethers.formatEther(event.args[2]),
                            txHash: event.transactionHash,
                            blockNumber: event.blockNumber
                        })
                    })
                    console.log(`=== End Comparison for Loan ${loanId} ===`)

                    // Debug logging - show each investment separately
                    console.log(`=== Loan ${loanId} Details ===`)
                    console.log('Requested Amount:', loanDetails.requestedAmount.toString(), 'wei =', ethers.formatEther(loanDetails.requestedAmount), 'HBAR')
                    console.log('Number of investments:', investments.length)

                    investments.forEach((inv: any, index: number) => {
                        console.log(`  Investment ${index + 1}:`)
                        console.log(`    Investor:`, inv.investor)
                        console.log(`    Amount:`, inv.amount.toString(), 'wei =', ethers.formatEther(inv.amount), 'HBAR')
                    })

                    console.log('Total Funded:', totalFunded.toString(), 'wei =', ethers.formatEther(totalFunded), 'HBAR')
                    console.log(`=== End Loan ${loanId} ===`)

                    // Format amounts to readable decimals (18 decimals for HBAR)
                    const requestedAmountHBAR = ethers.formatEther(loanDetails.requestedAmount)
                    const fundedAmountHBAR = ethers.formatEther(totalFunded)

                    return {
                        id: parseInt(loanId),
                        farmer: loanDetails.farmer,
                        cropType: '', // We need to get from harvest token
                        requestedAmount: requestedAmountHBAR, // Keep as string for display
                        interestRate: Number(loanDetails.interestRate),
                        duration: Number(loanDetails.duration),
                        fundedAmount: fundedAmountHBAR, // Keep as string for display
                        status: Number(loanDetails.status),
                        txHash: txHash,
                        isOnChain: true
                    } as Loan
                } catch (error) {
                    console.error('Error processing loan:', error)
                    return null
                }
            })

            const loans = (await Promise.all(loanPromises)).filter((loan): loan is Loan => loan !== null)

            // Get crop types from harvest tokens
            const loansWithCropType = await Promise.all(loans.map(async (loan) => {
                try {
                    const loanDetails = await contract.getLoanDetails(loan.id.toString())
                    const harvestToken = await contract.harvestTokens(loanDetails.harvestTokenId.toString())
                    return {
                        ...loan,
                        cropType: harvestToken.cropType
                    }
                } catch (error) {
                    console.error('Error getting crop type:', error)
                    return loan
                }
            }))

            return loansWithCropType

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
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">
                                    {blockchainLoans.length} On-Chain Loans
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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
                        <p className="mt-4 text-gray-600">Loading loans...</p>
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No loans found</p>
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

    // Debug logging for each loan card
    console.log(`LoanCard ${loan.id} progress calculation:`, {
        funded: funded,
        requested: requested,
        progress: progress,
        fundedAmount: loan.fundedAmount,
        requestedAmount: loan.requestedAmount
    })

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
