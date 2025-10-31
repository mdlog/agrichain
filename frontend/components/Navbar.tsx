'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl">🌾</span>
                        <span className="font-bold text-xl text-primary-600">AgriChain</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-primary-600 transition">Home</Link>
                        <Link href="/marketplace" className="text-gray-700 hover:text-primary-600 transition">Marketplace</Link>
                        <Link href="/farmer" className="text-gray-700 hover:text-primary-600 transition">Farmer</Link>
                        <Link href="/investor" className="text-gray-700 hover:text-primary-600 transition">Investor</Link>
                        <Link href="/about" className="text-gray-700 hover:text-primary-600 transition">About</Link>
                    </div>

                    <div className="hidden md:block">
                        <ConnectButton />
                    </div>

                    <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {isOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        <Link href="/" className="block text-gray-700 hover:text-primary-600 transition" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link href="/marketplace" className="block text-gray-700 hover:text-primary-600 transition" onClick={() => setIsOpen(false)}>Marketplace</Link>
                        <Link href="/farmer" className="block text-gray-700 hover:text-primary-600 transition" onClick={() => setIsOpen(false)}>Farmer</Link>
                        <Link href="/investor" className="block text-gray-700 hover:text-primary-600 transition" onClick={() => setIsOpen(false)}>Investor</Link>
                        <Link href="/about" className="block text-gray-700 hover:text-primary-600 transition" onClick={() => setIsOpen(false)}>About</Link>
                        <div className="pt-2">
                            <ConnectButton />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
