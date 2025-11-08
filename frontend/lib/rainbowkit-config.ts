import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// Define Hedera Testnet
export const hederaTestnet = defineChain({
    id: 296,
    name: 'Hedera Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'HBAR',
        symbol: 'HBAR',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet.hashio.io/api'],
        },
    },
    blockExplorers: {
        default: {
            name: 'HashScan',
            url: 'https://hashscan.io/testnet',
        },
    },
    testnet: true,
})

// Define Hedera Mainnet
export const hederaMainnet = defineChain({
    id: 295,
    name: 'Hedera Mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'HBAR',
        symbol: 'HBAR',
    },
    rpcUrls: {
        default: {
            http: ['https://mainnet.hashio.io/api'],
        },
    },
    blockExplorers: {
        default: {
            name: 'HashScan',
            url: 'https://hashscan.io/mainnet',
        },
    },
    testnet: false,
})

// Get WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId || projectId === 'your_project_id_here') {
    console.warn('⚠️  WalletConnect Project ID not configured!')
    console.warn('⚠️  Get your free Project ID from: https://cloud.walletconnect.com/')
    console.warn('⚠️  Add to .env: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id')
}

export const config = getDefaultConfig({
    appName: 'AgriChain Finance',
    projectId: projectId || '2c5e8c4f8b3a9d1e6f7c8b9a0d1e2f3a',
    chains: [hederaTestnet, hederaMainnet],
    ssr: true,
})
