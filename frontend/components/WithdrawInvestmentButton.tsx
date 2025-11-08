'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { TrendingUp, Loader2 } from 'lucide-react'
import { getContract } from '@/lib/contract'

interface WithdrawInvestmentButtonProps {
    loanId: number
    investmentIndex: number
    investmentAmount: string
    totalFunded: string
    totalRepayment: string
    onSuccess?: () => void
}

export default function WithdrawInvestmentButton({
    loanId,
    investmentIndex,
    investmentAmount,
    totalFunded,
    totalRepayment,
    onSuccess
}: WithdrawInvestmentButtonProps) {
    const [isWithdrawing, setIsWithdrawing] = useState(false)

    const handleWithdraw = async () => {
        try {
            setIsWithdrawing(true)

            // Calculate investor's share
            const investment = parseFloat(investmentAmount)
            const funded = parseFloat(totalFunded)
            const repayment = parseFloat(totalRepayment)
            const investorShare = (investment / funded) * repayment

            const loadingToast = toast.loading(`Withdrawing ${investorShare.toFixed(2)} HBAR...`)

            // Get signer
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = getContract(signer)

            console.log('💰 Withdrawing investment:', {
                loanId,
                investmentIndex,
                investmentAmount: investment.toFixed(2),
                totalFunded: funded.toFixed(2),
                totalRepayment: repayment.toFixed(2),
                investorShare: investorShare.toFixed(2)
            })

            // Call withdrawInvestment
            const tx = await contract.withdrawInvestment(loanId, investmentIndex)

            console.log('📝 Transaction sent:', tx.hash)
            toast.loading('Waiting for confirmation...', { id: loadingToast })

            const receipt = await tx.wait()
            console.log('✅ Transaction confirmed:', receipt.hash)

            toast.success(`Withdrawn ${investorShare.toFixed(2)} HBAR successfully!`, { id: loadingToast })
            toast.success(`Profit: ${(investorShare - investment).toFixed(2)} HBAR`)

            if (onSuccess) {
                onSuccess()
            }

        } catch (error: any) {
            console.error('❌ Error withdrawing investment:', error)

            let errorMessage = 'Failed to withdraw investment'
            if (error.message?.includes('Loan not repaid')) {
                errorMessage = 'Loan has not been repaid yet'
            } else if (error.message?.includes('Not investment owner')) {
                errorMessage = 'You are not the owner of this investment'
            } else if (error.message?.includes('Already withdrawn')) {
                errorMessage = 'Investment already withdrawn'
            }

            toast.error(errorMessage)
        } finally {
            setIsWithdrawing(false)
        }
    }

    // Calculate display values
    const investment = parseFloat(investmentAmount || '0')
    const funded = parseFloat(totalFunded || '1')
    const repayment = parseFloat(totalRepayment || '0')
    const investorShare = (investment / funded) * repayment
    const profit = investorShare - investment
    const roi = ((profit / investment) * 100).toFixed(2)

    return (
        <div className="space-y-4">
            {/* Withdrawal Breakdown */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Withdrawal Breakdown</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-green-700">Your Investment:</span>
                        <span className="font-semibold text-green-900">{investment.toFixed(2)} HBAR</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-green-700">Profit:</span>
                        <span className="font-semibold text-green-900">+{profit.toFixed(2)} HBAR</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-green-700">ROI:</span>
                        <span className="font-semibold text-green-900">{roi}%</span>
                    </div>
                    <div className="border-t border-green-300 pt-2 mt-2"></div>
                    <div className="flex justify-between">
                        <span className="font-bold text-green-900">Total Withdrawal:</span>
                        <span className="font-bold text-green-900 text-lg">{investorShare.toFixed(2)} HBAR</span>
                    </div>
                </div>
            </div>

            {/* Withdraw Button */}
            <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isWithdrawing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Withdrawing...
                    </>
                ) : (
                    <>
                        <TrendingUp className="w-5 h-5" />
                        Withdraw ({investorShare.toFixed(2)} HBAR)
                    </>
                )}
            </button>

            <p className="text-xs text-gray-500 text-center">
                You will receive your investment plus {roi}% profit
            </p>
        </div>
    )
}
