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
    connectWallet: () => void
    disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType>({
    account: null,
    provider: null,
    signer: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    connectWallet: () => { },
    disconnectWallet: () => { },
})

export function WalletProvider({ children }: { children: ReactNode }) {
    const { address, isConnected, chain } = useAccount()
    const { data: walletClient } = useWalletClient()
    const { disconnect } = useDisconnect()
    const { openConnectModal } = useConnectModal()

    const [provider, setProvider] = useState<BrowserProvider | null>(null)
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

    // Setup ethers provider when wallet connects
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
                    setProvider(null)
                    setSigner(null)
                }
            } else {
                setProvider(null)
                setSigner(null)
            }
        }
        setupProvider()
    }, [walletClient, isConnected, address])

    const connectWallet = () => {
        if (openConnectModal) {
            openConnectModal()
        } else {
            toast.error('Connect modal not available')
        }
    }

    const disconnectWallet = () => {
        try {
            disconnect()
            setProvider(null)
            setSigner(null)
            toast.success('Wallet disconnected')
        } catch (error) {
            console.error('Disconnect error:', error)
            toast.error('Failed to disconnect wallet')
        }
    }

    return (
        <WalletContext.Provider
            value={{
                account: address || null,
                provider,
                signer,
                isConnected,
                isConnecting: false,
                chainId: chain?.id || null,
                connectWallet,
                disconnectWallet
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => useContext(WalletContext)
