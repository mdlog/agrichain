'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, X, RefreshCw } from 'lucide-react'
import { clearOldLoans } from '@/lib/clearOldData'

/**
 * Component to warn users about old data format and offer to clear it
 */
export default function DataMigrationWarning() {
    const [hasOldData, setHasOldData] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [isClearing, setIsClearing] = useState(false)

    useEffect(() => {
        // Check if there's old data in localStorage
        if (typeof window !== 'undefined') {
            const farmerLoans = localStorage.getItem('farmerCreatedLoans')
            const marketplaceLoans = localStorage.getItem('marketplaceLoans')

            // Check if data exists and might be in old format
            if (farmerLoans || marketplaceLoans) {
                try {
                    // Try to detect old format (this is a simple check)
                    const loans = JSON.parse(farmerLoans || marketplaceLoans || '[]')

                    // If there are loans without isOnChain flag, they might be old
                    const hasOldFormat = loans.some((loan: any) =>
                        !loan.isOnChain && !loan.txHash
                    )

                    if (hasOldFormat) {
                        setHasOldData(true)
                    }
                } catch {
                    // If parsing fails, might be corrupted old data
                    setHasOldData(true)
                }
            }
        }
    }, [])

    const handleClearData = () => {
        setIsClearing(true)

        setTimeout(() => {
            const success = clearOldLoans()

            if (success) {
                setHasOldData(false)
                setIsVisible(false)

                // Reload page after a short delay
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            }

            setIsClearing(false)
        }, 500)
    }

    if (!hasOldData || !isVisible) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-up">
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

                    <div className="flex-1">
                        <h3 className="font-bold text-yellow-900 mb-1">
                            Old Data Format Detected
                        </h3>
                        <p className="text-sm text-yellow-800 mb-3">
                            We detected loan data that might be in an old format.
                            To ensure proper HBAR display and prevent issues, we recommend clearing old data.
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleClearData}
                                disabled={isClearing}
                                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium disabled:opacity-50"
                            >
                                {isClearing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Clearing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Clear Old Data
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                            >
                                Dismiss
                            </button>
                        </div>

                        <p className="text-xs text-yellow-700 mt-2">
                            Note: This will only clear local display data. Blockchain data is safe.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
