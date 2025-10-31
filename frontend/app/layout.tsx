'use client'

import { Inter } from 'next/font/google'
import './globals.css'

import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { WalletProvider } from '@/context/WalletContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/rainbowkit-config'

const inter = Inter({ subsets: ['latin'] })
const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
