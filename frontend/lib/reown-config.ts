import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, sepolia, polygon } from '@reown/appkit/networks'

// Hedera network configuration
const hederaTestnet = {
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
}

const hederaMainnet = {
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
}

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Set up metadata
const metadata = {
    name: 'AgriChain Finance',
    description: 'Decentralized Agricultural Financing Platform',
    url: 'https://agrichain.finance',
    icons: ['https://agrichain.finance/icon.png']
}

// 3. Create the AppKit instance
export const appKit = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [hederaTestnet, hederaMainnet, sepolia],
    defaultNetwork: hederaTestnet,
    metadata,
    projectId,
    features: {
        analytics: true,
        email: false,
        socials: false,
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#16a34a',
        '--w3m-border-radius-master': '8px',
    }
})

export { hederaTestnet, hederaMainnet }
