'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { TrendingUp, Wallet as WalletIcon, DollarSign, Clock, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import { weiToHBAR, formatHBARNumber } from '@/lib/hbarUtils'
import toast from 'react-hot-toast'

export default function InvestorDashboard() {
    const { account, connectWallet, provider, signer } = useWallet()
    const [activeTab, setActiveTab] = useState<'portfolio' | 'available'>('portfolio')

    // Real stats from blockchain
    const [totalInvested, setTotalInvested] = useState<string>('0')
    const [totalReturns, setTotalReturns] = useState<string>('0')
    const [activeInvestments, setActiveInvestments] = useState<number>(0)
    const [avgDuration, setAvgDuration] = useState<number>(0)

    if (!account) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <TrendingUp className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Investor Dashboard</h2>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet to start investing in agricultural loans
                    </p>
                    <button onClick={connectWallet} className="btn-primary w-full">
                        Connect Wallet
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Investor Dashboard</h1>
                    <p className="text-gray-600">Track your investments and discover new opportunities</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<DollarSign className="w-6 h-6" />}
                        label="Total Invested"
                        value={`${totalInvested} HBAR`}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        label="Total Returns"
                        value={`${totalReturns} HBAR`}
                    />
                    <StatCard
                        icon={<WalletIcon className="w-6 h-6" />}
                        label="Active Investments"
                        value={activeInvestments.toString()}
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        label="Avg. Duration"
                        value={`${avgDuration} days`}
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'portfolio'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        My Portfolio
                    </button>
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`px-6 py-3 rounded-lg font-medium transition ${activeTab === 'available'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Available Loans
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'portfolio' ? (
                    <Portfolio
                        provider={provider}
                        account={account}
                        signer={signer}
                        setTotalInvested={setTotalInvested}
                        setTotalReturns={setTotalReturns}
                        setActiveInvestments={setActiveInvestments}
                        setAvgDuration={setAvgDuration}
                    />
                ) : (
                    <AvailableLoans />
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, change }: {
    icon: React.ReactNode
    label: string
    value: string
    change?: string
}) {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-2">
                <div className="text-primary-600">{icon}</div>
                {change && (
                    <span className="text-sm font-medium text-green-600">{change}</span>
                )}
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    )
}

function Portfolio({
    provider,
    account,
    signer,
    setTotalInvested,
    setTotalReturns,
    setActiveInvestments,
    setAvgDuration
}: {
    provider: any
    account: string | null
    signer: any
    setTotalInvested: (value: string) => void
    setTotalReturns: (value: string) => void
    setActiveInvestments: (value: number) => void
    setAvgDuration: (value: number) => void
}) {
    const [investments, setInvestments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [withdrawingLoans, setWithdrawingLoans] = useState<Set<number>>(new Set())

    // Helper function to load investments (reusable)
    const loadInvestments = async () => {
            if (!provider || !account) {
                setLoading(false)
                return
            }

            try {
                const contract = getContract(provider)
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

                if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                    setLoading(false)
                    return
                }

                // Get investor's loan IDs
                const loanIdsRaw = await contract.getInvestorInvestments(account)

                // Remove duplicate loan IDs (contract adds loan ID every time investor invests)
                const uniqueLoanIds = [...new Set(loanIdsRaw.map((id: bigint) => id.toString()))].map(id => BigInt(id))

                console.log('Raw loan IDs:', loanIdsRaw.map((id: bigint) => id.toString()))
                console.log('Unique loan IDs:', uniqueLoanIds.map(id => id.toString()))

                // Fetch investment details for each loan
                const investmentsList = await Promise.all(uniqueLoanIds.map(async (loanId: bigint) => {
                    try {
                        const loanDetails = await contract.getLoanDetails(loanId)
                        const investments = await contract.getLoanInvestments(loanId)
                        const harvestToken = await contract.harvestTokens(loanDetails.harvestTokenId)

                        // Find this investor's investments in this loan
                        const investorInvestments = investments.filter(
                            (inv: any) => inv.investor.toLowerCase() === account.toLowerCase()
                        )

                        // Combine all investments from this investor in this loan
                        const totalInvested = investorInvestments.reduce(
                            (sum: bigint, inv: any) => sum + inv.amount,
                            BigInt(0)
                        )

                        if (totalInvested === BigInt(0)) {
                            return null
                        }

                        const investedHBAR = parseFloat(weiToHBAR(totalInvested))
                        const expectedReturn = investedHBAR * (1 + Number(loanDetails.interestRate) / 10000)

                        // Calculate withdrawable amount if loan is repaid
                        let withdrawableAmount = 0
                        const withdrawnCount = investorInvestments.filter((inv: any) => inv.withdrawn).length
                        const hasWithdrawable = Number(loanDetails.status) === 2 && withdrawnCount < investorInvestments.length

                        if (hasWithdrawable) {
                            // Calculate total withdrawable share
                            const notWithdrawnInvestments = investorInvestments.filter((inv: any) => !inv.withdrawn)
                            const totalNotWithdrawn = notWithdrawnInvestments.reduce(
                                (sum: bigint, inv: any) => sum + inv.amount,
                                BigInt(0)
                            )
                            const interest = (loanDetails.requestedAmount * BigInt(loanDetails.interestRate)) / BigInt(10000)
                            const totalRepayment = loanDetails.requestedAmount + interest
                            const withdrawableShare = (totalNotWithdrawn * totalRepayment) / loanDetails.fundedAmount
                            withdrawableAmount = parseFloat(weiToHBAR(withdrawableShare.toString()))
                        }

                        return {
                            loanId: Number(loanId),
                            cropType: harvestToken.cropType,
                            farmer: loanDetails.farmer,
                            invested: formatHBARNumber(investedHBAR.toString()), // Total invested in this loan
                            investmentCount: investorInvestments.length, // Number of separate investments
                            withdrawnCount: withdrawnCount, // Number of withdrawn investments
                            interestRate: Number(loanDetails.interestRate),
                            duration: Number(loanDetails.duration),
                            status: Number(loanDetails.status),
                            expectedReturn: expectedReturn,
                            daysLeft: Number(loanDetails.duration), // Simplified
                            withdrawableAmount: withdrawableAmount,
                            hasWithdrawable: hasWithdrawable,
                            fundedAmount: loanDetails.fundedAmount,
                            requestedAmount: loanDetails.requestedAmount
                        }
                    } catch (error) {
                        console.error('Error loading investment:', error)
                        return null
                    }
                }))

                // Filter out null values and flatten
                const flatInvestments = investmentsList.filter((inv): inv is NonNullable<typeof inv> => inv !== null)
                setInvestments(flatInvestments)

                // Calculate stats
                const totalInv = flatInvestments.reduce((sum, inv) => sum + parseFloat(inv.invested || '0'), 0)
                const totalRet = flatInvestments.reduce((sum, inv) => sum + parseFloat(inv.expectedReturn || '0'), 0)
                const active = flatInvestments.filter(inv => inv.status === 0 || inv.status === 1).length
                const avgDur = flatInvestments.length > 0
                    ? flatInvestments.reduce((sum, inv) => sum + (inv.duration || 0), 0) / flatInvestments.length
                    : 0

                setTotalInvested(totalInv.toFixed(2))
                setTotalReturns(totalRet.toFixed(2))
                setActiveInvestments(active)
                setAvgDuration(Math.round(avgDur))
            } catch (error) {
                console.error('Error loading investments:', error)
            } finally {
                setLoading(false)
            }
    }

    // Load investments on mount
    useEffect(() => {
        if (provider && account) {
            loadInvestments()
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, account])

    // Function to withdraw all investments for a loan
    const handleWithdraw = async (loanId: number) => {
        if (!signer || !account) {
            toast.error('Please connect your wallet')
            return
        }

        try {
            setWithdrawingLoans(prev => new Set(prev).add(loanId))
            const contract = getContract(signer)
            
            // Get all investments for this loan
            const investments = await contract.getLoanInvestments(loanId)
            const loanDetails = await contract.getLoanDetails(loanId)

            // Filter investments that belong to this investor and haven't been withdrawn
            const investorInvestments = investments.filter(
                (inv: any) => inv.investor.toLowerCase() === account.toLowerCase() && !inv.withdrawn
            )

            if (investorInvestments.length === 0) {
                toast.error('No investments available to withdraw')
                return
            }

            // Check if loan is repaid
            if (Number(loanDetails.status) !== 2) {
                toast.error('Loan has not been repaid yet')
                return
            }

            const loadingToast = toast.loading(`Withdrawing ${investorInvestments.length} investment(s)...`)

            // Withdraw each investment (need to call multiple times for multiple investments)
            let successCount = 0
            let totalWithdrawn = BigInt(0)

            for (let i = 0; i < investments.length; i++) {
                const inv = investments[i]
                if (inv.investor.toLowerCase() === account.toLowerCase() && !inv.withdrawn) {
                    try {
                        const tx = await contract.withdrawInvestment(loanId, i)
                        await tx.wait()
                        successCount++
                        
                        // Calculate amount withdrawn
                        const interest = (loanDetails.requestedAmount * BigInt(loanDetails.interestRate)) / BigInt(10000)
                        const totalRepayment = loanDetails.requestedAmount + interest
                        const investorShare = (inv.amount * totalRepayment) / loanDetails.fundedAmount
                        totalWithdrawn += investorShare
                    } catch (error: any) {
                        console.error(`Error withdrawing investment ${i}:`, error)
                        // Continue with other investments
                    }
                }
            }

            toast.dismiss(loadingToast)

            if (successCount > 0) {
                const withdrawnHBAR = parseFloat(weiToHBAR(totalWithdrawn.toString()))
                toast.success(`Successfully withdrawn ${formatHBARNumber(withdrawnHBAR.toString())} HBAR!`)
                
                // Reload investments by calling the loadInvestments function
                if (provider && account) {
                    await loadInvestments()
                }
            } else {
                toast.error('Failed to withdraw investments')
            }
        } catch (error: any) {
            console.error('Error withdrawing:', error)
            const errorMsg = error.reason || error.message || 'Failed to withdraw'
            toast.error(`Withdrawal failed: ${errorMsg}`)
        } finally {
            setWithdrawingLoans(prev => {
                const newSet = new Set(prev)
                newSet.delete(loanId)
                return newSet
            })
        }
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading investments...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {investments.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-600 mb-4">You don't have any investments yet</p>
                    <Link href="/marketplace" className="btn-primary inline-block">
                        Browse Loans
                    </Link>
                </div>
            ) : (
                investments.map((investment, index) => (
                    <div key={`${investment.loanId}-${index}`} className="card">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Left */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold">🌾 {investment.cropType}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${investment.status === 0 || investment.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                        investment.status === 2 ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {investment.status === 0 || investment.status === 1 ? 'Active' :
                                            investment.status === 2 ? 'Completed' : 'Unknown'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Farmer: <span className="font-mono">{investment.farmer.slice(0, 6)}...{investment.farmer.slice(-4)}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Loan #{investment.loanId}
                                    {investment.investmentCount > 1 && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                            {investment.investmentCount} investments
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Middle */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                <div>
                                    <p className="text-xs text-gray-500">Invested</p>
                                    <p className="font-bold">{investment.invested} HBAR</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Expected Return</p>
                                    <p className="font-bold text-green-600">{investment.expectedReturn.toFixed(2)} HBAR</p>
                                    {investment.hasWithdrawable && (
                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                            💰 {formatHBARNumber(investment.withdrawableAmount.toString())} available
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Interest</p>
                                    <p className="font-bold">{(investment.interestRate / 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Duration</p>
                                    <p className="font-bold">{investment.duration} days</p>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/loan/${investment.loanId}`}
                                    className="btn-secondary whitespace-nowrap"
                                >
                                    View Details
                                </Link>
                                {investment.hasWithdrawable && (
                                    <button
                                        onClick={() => handleWithdraw(investment.loanId)}
                                        disabled={withdrawingLoans.has(investment.loanId)}
                                        className={`btn-primary whitespace-nowrap flex items-center justify-center gap-2 ${
                                            withdrawingLoans.has(investment.loanId) 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : ''
                                        }`}
                                    >
                                        {withdrawingLoans.has(investment.loanId) ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Withdrawing...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                Withdraw {investment.withdrawableAmount > 0 ? formatHBARNumber(investment.withdrawableAmount.toString()) : ''} HBAR
                                            </>
                                        )}
                                    </button>
                                )}
                                {investment.status === 2 && investment.investmentCount === investment.withdrawnCount && (
                                    <div className="text-xs text-green-600 font-medium text-center">
                                        ✓ Fully Withdrawn
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

function AvailableLoans() {
    // Available Loans now redirects to marketplace
    return (
        <div className="card text-center py-12">
            <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold mb-4">Browse Available Loans</h3>
                <p className="text-gray-600 mb-6">
                    View and invest in available loans from the marketplace
                </p>
                <Link href="/marketplace" className="btn-primary inline-block">
                    Go to Marketplace
                </Link>
            </div>
        </div>
    )
}
