'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link 
                        href="/" 
                        className="flex items-center space-x-2"
                        prefetch={true}
                    >
                        <span className="text-2xl">🌾</span>
                        <span className="font-bold text-xl text-primary-600">AgriChain</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink href="/" currentPath={pathname}>Home</NavLink>
                        <NavLink href="/marketplace" currentPath={pathname}>Marketplace</NavLink>
                        <NavLink href="/farmer" currentPath={pathname}>Farmer</NavLink>
                        <NavLink href="/investor" currentPath={pathname}>Investor</NavLink>
                        <NavLink href="/about" currentPath={pathname}>About</NavLink>
                    </div>

                    <div className="hidden md:block">
                        <ConnectButton />
                    </div>

                    <button 
                        className="md:hidden" 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isOpen && (
                    <div className="md:hidden py-4 space-y-4">
                        <MobileNavLink href="/" currentPath={pathname} onClick={() => setIsOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink href="/marketplace" currentPath={pathname} onClick={() => setIsOpen(false)}>Marketplace</MobileNavLink>
                        <MobileNavLink href="/farmer" currentPath={pathname} onClick={() => setIsOpen(false)}>Farmer</MobileNavLink>
                        <MobileNavLink href="/investor" currentPath={pathname} onClick={() => setIsOpen(false)}>Investor</MobileNavLink>
                        <MobileNavLink href="/about" currentPath={pathname} onClick={() => setIsOpen(false)}>About</MobileNavLink>
                        <div className="pt-2">
                            <ConnectButton />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

function NavLink({ href, currentPath, children }: { 
    href: string
    currentPath: string
    children: React.ReactNode
}) {
    const isActive = currentPath === href
    
    return (
        <Link
            href={href}
            prefetch={true}
            className={`text-gray-700 hover:text-primary-600 transition-colors duration-150 ${
                isActive ? 'text-primary-600 font-semibold' : ''
            }`}
        >
            {children}
        </Link>
    )
}

function MobileNavLink({ href, currentPath, onClick, children }: { 
    href: string
    currentPath: string
    onClick: () => void
    children: React.ReactNode
}) {
    const isActive = currentPath === href
    
    return (
        <Link
            href={href}
            prefetch={true}
            onClick={onClick}
            className={`block text-gray-700 hover:text-primary-600 transition-colors duration-150 ${
                isActive ? 'text-primary-600 font-semibold' : ''
            }`}
        >
            {children}
        </Link>
    )
}
