'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useAccount, useDisconnect, useWalletClient } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import toast from 'react-hot-toast'

interface WalletContextType {
    account: string | null
    provider: BrowserProvider | null
    signer: JsonRpcSigner | null
    isConnected: boolean
    isConnecting: boolean
    chainId: number | null
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
    account: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    connectWallet: async () => { },
    disconnectWallet: () => { },
})

export function WalletProvider({ children }: { children: ReactNode }) {
    const { address, isConnected, chain } = useAccount()
    const { data: walletClient } = useWalletClient()
    const { disconnect } = useDisconnect()
    const { openConnectModal } = useConnectModal()

    const [provider, setProvider] = useState<BrowserProvider | null>(null)
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        const setupProvider = async () => {
            if (walletClient && isConnected && address) {
                try {
                    const ethersProvider = new BrowserProvider(walletClient as any)
                    const ethersSigner = await ethersProvider.getSigner()
                    setProvider(ethersProvider)
                    setSigner(ethersSigner)
                } catch (error) {
                    console.error('Error setting up provider:', error)
                }
            } else {
                setProvider(null)
                setSigner(null)
            }
        }
        setupProvider()
    }, [walletClient, isConnected, address, chain])

    const connectWallet = async () => {
        try {
            setIsConnecting(true)
            if (openConnectModal) openConnectModal()
        } catch (error: any) {
            toast.error('Failed to connect wallet')
        } finally {
            setIsConnecting(false)
        }
    }

    const disconnectWallet = async () => {
        try {
            disconnect()
            setProvider(null)
            setSigner(null)
            toast.success('Wallet disconnected')
        } catch (error) {
            toast.error('Failed to disconnect wallet')
        }
    }

    return (
        <WalletContext.Provider value={{ account: address || null, provider, signer, isConnected, isConnecting, chainId: chain?.id || null, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext)
