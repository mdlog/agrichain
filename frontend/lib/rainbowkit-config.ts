import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { Chain } from 'wagmi/chains'

// Define Hedera Testnet
export const hederaTestnet: Chain = {
    id: 296,
    name: 'Hedera Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'HBAR',
        symbol: 'HBAR',
    },
    rpcUrls: {
        default: {
            http: [
                'https://testnet.hashio.io/api',
                'https://testnet.hedera.com',
            ],
        },
        public: {
            http: [
                'https://testnet.hashio.io/api',
                'https://testnet.hedera.com',
            ],
        },
    },
    blockExplorers: {
        default: {
            name: 'HashScan',
            url: 'https://hashscan.io/testnet',
        },
    },
    testnet: true,
}

// Define Hedera Mainnet
export const hederaMainnet: Chain = {
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
}

// Validate project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId || projectId === 'placeholder_walletconnect_project_id' || projectId === '') {
    console.warn('⚠️  WalletConnect Project ID not set. Please get one from: https://cloud.walletconnect.com/')
    console.warn('⚠️  Using demo project ID - wallet connection may not work properly')
}

export const config = getDefaultConfig({
    appName: 'AgriChain Finance',
    // Use demo project ID if not provided (for development only)
    projectId: projectId && projectId !== 'placeholder_walletconnect_project_id'
        ? projectId
        : 'demo_project_id_for_development_only',
    chains: [hederaTestnet, hederaMainnet],
    ssr: true,
})
