'use client'

import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RouteProgress from '@/components/RouteProgress'
import { WalletProvider } from '@/context/WalletContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/rainbowkit-config'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

// Create a client outside component to avoid re-creation
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
            },
        },
    })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (typeof window === 'undefined') {
        return makeQueryClient()
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient()

    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@rainbow-me/rainbowkit@2/dist/index.css" />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider theme={darkTheme({ accentColor: '#16a34a', borderRadius: 'medium' })}>
                            <WalletProvider>
                                <RouteProgress />
                                <div className="flex flex-col min-h-screen">
                                    <Navbar />
                                    <main className="flex-grow">{children}</main>
                                    <Footer />
                                </div>
                                <Toaster position="top-right" />
                            </WalletProvider>
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </body>
        </html>
    )
}
