import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl">🌾</span>
                            <span className="font-bold text-xl text-white">AgriChain</span>
                        </div>
                        <p className="text-sm">
                            Decentralized agricultural financing platform using Hedera blockchain.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-primary-400 transition">Home</Link></li>
                            <li><Link href="/marketplace" className="hover:text-primary-400 transition">Marketplace</Link></li>
                            <li><Link href="/farmer" className="hover:text-primary-400 transition">For Farmers</Link></li>
                            <li><Link href="/investor" className="hover:text-primary-400 transition">For Investors</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-primary-400 transition">About Us</Link></li>
                            <li><Link href="/security" className="hover:text-primary-400 transition">Security & Verification</Link></li>
                            <li>
                                <a
                                    href="https://docs.hedera.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition"
                                >
                                    Hedera Docs
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/yourusername/agrichain-finance"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition"
                                >
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://portal.hedera.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-400 transition"
                                >
                                    Hedera Portal
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com/yourusername/agrichain-finance"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary-400 transition"
                                aria-label="GitHub Repository"
                            >
                                <Github className="w-6 h-6" />
                            </a>
                            <a
                                href="https://twitter.com/agrichain"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary-400 transition"
                                aria-label="Twitter Profile"
                            >
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a
                                href="mailto:hello@agrichain.finance"
                                className="hover:text-primary-400 transition"
                                aria-label="Email Contact"
                            >
                                <Mail className="w-6 h-6" />
                            </a>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-400">
                                Built with ❤️ for Hedera Hackathon
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                    <p>&copy; 2025 AgriChain Finance. Built on Hedera. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                        <Link href="/privacy" className="hover:text-primary-400 transition text-xs">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary-400 transition text-xs">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
