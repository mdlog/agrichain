'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'

import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import RouteProgress from '@/components/RouteProgress'
import { WalletProvider } from '@/context/WalletContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/rainbowkit-config'

const inter = Inter({ subsets: ['latin'] })

// Create QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className} suppressHydrationWarning>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider>
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
