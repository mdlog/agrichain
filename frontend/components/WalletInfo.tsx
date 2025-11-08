'use client'

import { useAccount, useBalance } from 'wagmi'
import { useWallet } from '@/context/WalletContext'

export default function WalletInfo() {
    const { address, isConnected, chain } = useAccount()
    const { data: balance } = useBalance({ address })
    const { provider, signer } = useWallet()

    if (!isConnected) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                    ⚠️ Wallet not connected. Click "Connect Wallet" button to get started.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-green-900">✅ Wallet Connected</h3>
            <div className="text-sm space-y-1">
                <p className="text-gray-700">
                    <span className="font-medium">Address:</span>{' '}
                    <code className="bg-white px-2 py-1 rounded text-xs">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </code>
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Network:</span>{' '}
                    <span className="text-green-600">{chain?.name || 'Unknown'}</span>
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Chain ID:</span> {chain?.id}
                </p>
                {balance && (
                    <p className="text-gray-700">
                        <span className="font-medium">Balance:</span>{' '}
                        {Number.parseFloat(balance.value.toString()) / 1e18} {balance.symbol}
                    </p>
                )}
                <p className="text-gray-700">
                    <span className="font-medium">Provider:</span>{' '}
                    {provider ? '✅ Ready' : '❌ Not Ready'}
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Signer:</span>{' '}
                    {signer ? '✅ Ready' : '❌ Not Ready'}
                </p>
            </div>
        </div>
    )
}
