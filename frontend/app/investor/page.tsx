'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { TrendingUp, Wallet as WalletIcon, DollarSign, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { getContract } from '@/lib/contract'
import { ethers } from 'ethers'
import { weiToHBAR, formatHBARNumber } from '@/lib/hbarUtils'

export default function InvestorDashboard() {
    const { account, connectWallet, provider } = useWallet()
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
    setTotalInvested,
    setTotalReturns,
    setActiveInvestments,
    setAvgDuration
}: {
    provider: any
    account: string | null
    setTotalInvested: (value: string) => void
    setTotalReturns: (value: string) => void
    setActiveInvestments: (value: number) => void
    setAvgDuration: (value: number) => void
}) {
    const [investments, setInvestments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Load investments from blockchain
    useEffect(() => {
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

                        return {
                            loanId: Number(loanId),
                            cropType: harvestToken.cropType,
                            farmer: loanDetails.farmer,
                            invested: formatHBARNumber(investedHBAR.toString()), // Total invested in this loan
                            investmentCount: investorInvestments.length, // Number of separate investments
                            interestRate: Number(loanDetails.interestRate),
                            duration: Number(loanDetails.duration),
                            status: Number(loanDetails.status),
                            expectedReturn: expectedReturn,
                            daysLeft: Number(loanDetails.duration) // Simplified
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

        loadInvestments()
    }, [provider, account])

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
                            <div>
                                <Link
                                    href={`/loan/${investment.loanId}`}
                                    className="btn-secondary whitespace-nowrap"
                                >
                                    View Details
                                </Link>
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
