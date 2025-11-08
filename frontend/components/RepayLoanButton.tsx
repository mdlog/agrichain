'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { DollarSign, Loader2 } from 'lucide-react'
import { getContract } from '@/lib/contract'

interface RepayLoanButtonProps {
    loanId: number
    requestedAmount: string
    interestRate: number
    onSuccess?: () => void
}

export default function RepayLoanButton({
    loanId,
    requestedAmount,
    interestRate,
    onSuccess
}: RepayLoanButtonProps) {
    const [isRepaying, setIsRepaying] = useState(false)

    const handleRepay = async () => {
        try {
            setIsRepaying(true)

            // Calculate total repayment
            const principal = parseFloat(requestedAmount)
            const interest = (principal * interestRate) / 10000
            const totalRepayment = principal + interest

            const loadingToast = toast.loading(`Repaying ${totalRepayment.toFixed(2)} HBAR...`)

            // Get signer
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const contract = getContract(signer)

            // Convert HBAR to tinybar (1 HBAR = 100,000,000 tinybar)
            const totalRepaymentTinybar = Math.ceil(totalRepayment * 100_000_000)

            console.log('💰 Repaying loan:', {
                loanId,
                principal: principal.toFixed(2),
                interest: interest.toFixed(2),
                total: totalRepayment.toFixed(2),
                tinybar: totalRepaymentTinybar
            })

            // Call repayLoan with HBAR value
            const tx = await contract.repayLoan(loanId, {
                value: totalRepaymentTinybar
            })

            console.log('📝 Transaction sent:', tx.hash)
            toast.loading('Waiting for confirmation...', { id: loadingToast })

            const receipt = await tx.wait()
            console.log('✅ Transaction confirmed:', receipt.hash)

            toast.success('Loan repaid successfully!', { id: loadingToast })
            toast.success('Your NFT collateral has been unlocked!')

            if (onSuccess) {
                onSuccess()
            }

        } catch (error: any) {
            console.error('❌ Error repaying loan:', error)

            let errorMessage = 'Failed to repay loan'
            if (error.message?.includes('Insufficient repayment')) {
                errorMessage = 'Insufficient repayment amount'
            } else if (error.message?.includes('Not loan owner')) {
                errorMessage = 'You are not the owner of this loan'
            } else if (error.message?.includes('Loan not funded')) {
                errorMessage = 'Loan is not funded yet'
            } else if (error.message?.includes('insufficient funds')) {
                errorMessage = 'Insufficient HBAR balance in your wallet'
            }

            toast.error(errorMessage)
        } finally {
            setIsRepaying(false)
        }
    }

    // Calculate display values
    const principal = parseFloat(requestedAmount || '0')
    const interest = (principal * interestRate) / 10000
    const totalRepayment = principal + interest

    return (
        <div className="space-y-4">
            {/* Repayment Breakdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Repayment Breakdown</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-blue-700">Principal:</span>
                        <span className="font-semibold text-blue-900">{principal.toFixed(2)} HBAR</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Interest ({(interestRate / 100).toFixed(1)}%):</span>
                        <span className="font-semibold text-blue-900">{interest.toFixed(2)} HBAR</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 mt-2"></div>
                    <div className="flex justify-between">
                        <span className="font-bold text-blue-900">Total Repayment:</span>
                        <span className="font-bold text-blue-900 text-lg">{totalRepayment.toFixed(2)} HBAR</span>
                    </div>
                </div>
            </div>

            {/* Repay Button */}
            <button
                onClick={handleRepay}
                disabled={isRepaying}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isRepaying ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Repaying...
                    </>
                ) : (
                    <>
                        <DollarSign className="w-5 h-5" />
                        Repay Loan ({totalRepayment.toFixed(2)} HBAR)
                    </>
                )}
            </button>

            <p className="text-xs text-gray-500 text-center">
                After repayment, your NFT collateral will be unlocked and available for reuse.
            </p>
        </div>
    )
}
