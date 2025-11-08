'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import WalletInfo from '@/components/WalletInfo'

export default function TestWalletPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🔌 Test Wallet Connection
                    </h1>
                    <p className="text-gray-600">
                        Test RainbowKit wallet integration dengan Hedera Network
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">1. Connect Your Wallet</h2>
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">2. Wallet Status</h2>
                        <WalletInfo />
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">3. Setup Instructions</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                            <p className="text-sm text-blue-900">
                                <strong>Untuk menggunakan wallet:</strong>
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                <li>Install MetaMask atau wallet lain yang didukung</li>
                                <li>
                                    Tambahkan Hedera Testnet ke wallet:
                                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                        <li>Network Name: Hedera Testnet</li>
                                        <li>RPC URL: https://testnet.hashio.io/api</li>
                                        <li>Chain ID: 296</li>
                                        <li>Currency: HBAR</li>
                                    </ul>
                                </li>
                                <li>
                                    Dapatkan testnet HBAR dari faucet:{' '}
                                    <a
                                        href="https://portal.hedera.com/faucet"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        portal.hedera.com/faucet
                                    </a>
                                </li>
                                <li>Klik "Connect Wallet" di atas</li>
                            </ol>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">4. Environment Setup</h2>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 mb-2">
                                <strong>Pastikan .env sudah dikonfigurasi:</strong>
                            </p>
                            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                {`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_HEDERA_NETWORK=testnet
CONTRACT_ADDRESS=0xYourContractAddress`}
                            </pre>
                            <p className="text-xs text-gray-600 mt-2">
                                Get WalletConnect Project ID:{' '}
                                <a
                                    href="https://cloud.walletconnect.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    cloud.walletconnect.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
