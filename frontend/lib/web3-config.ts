import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

// Define Hedera networks
export const hederaTestnet = {
    id: 296,
    name: 'Hedera Testnet',
    network: 'hedera-testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'HBAR',
        symbol: 'HBAR',
    },
    rpcUrls: {
        default: {
            http: ['https://testnet.hashio.io/api'],
        },
        public: {
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
} as const

export const hederaMainnet = {
    id: 295,
    name: 'Hedera Mainnet',
    network: 'hedera-mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'HBAR',
        symbol: 'HBAR',
    },
    rpcUrls: {
        default: {
            http: ['https://mainnet.hashio.io/api'],
        },
        public: {
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
} as const

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// 2. Create wagmiConfig
const metadata = {
    name: 'AgriChain Finance',
    description: 'Decentralized Agricultural Financing Platform',
    url: 'https://agrichain.finance',
    icons: ['https://agrichain.finance/icon.png']
}

const chains = [hederaTestnet, hederaMainnet, sepolia] as const
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
})

// 3. Create modal
if (typeof window !== 'undefined' && projectId) {
    createWeb3Modal({
        wagmiConfig: config,
        projectId,
        chains,
        themeMode: 'light',
        themeVariables: {
            '--w3m-accent': '#16a34a',
            '--w3m-border-radius-master': '8px',
        }
    })
}

export { projectId }
