import { Target, Users, Globe, Zap, Shield, TrendingUp } from 'lucide-react'

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">About AgriChain Finance</h1>
                    <p className="text-xl max-w-3xl mx-auto text-primary-100">
                        We're building the future of agricultural financing that is more inclusive,
                        transparent, and sustainable using Hedera blockchain technology.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <Target className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                            <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
                            <p className="text-xl text-gray-600">
                                Empowering farmers with fair access to financing and giving
                                investors opportunities to contribute to global food security.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="card">
                                <h3 className="text-xl font-bold mb-3">🌾 For Farmers</h3>
                                <p className="text-gray-600">
                                    Providing access to capital without requiring bank accounts or physical collateral.
                                    Farmers can tokenize future harvests and get loans
                                    through a fast and transparent process.
                                </p>
                            </div>
                            <div className="card">
                                <h3 className="text-xl font-bold mb-3">💰 For Investors</h3>
                                <p className="text-gray-600">
                                    Offering investment opportunities with competitive returns (4-6%) while
                                    supporting sustainable agriculture. All transactions recorded on blockchain
                                    for full transparency.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem & Solution */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">The Problem We Solve</h2>

                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Limited Access to Finance</h3>
                                    <p className="text-gray-600">
                                        Millions of farmers worldwide don't have access to formal banking services.
                                        They struggle to get capital to buy fertilizer, seeds, and equipment.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">High Interest Rates</h3>
                                    <p className="text-gray-600">
                                        Informal financial institutions often charge 20-40% interest per year,
                                        trapping farmers in a cycle of debt.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">❌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Lack of Transparency</h3>
                                    <p className="text-gray-600">
                                        Traditional financing systems lack transparency, with hidden fees
                                        and unclear processes.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-primary-50 rounded-xl">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-primary-900">Our Solution</h3>
                                        <p className="text-primary-800">
                                            AgriChain Finance uses Hedera blockchain to create an
                                            inclusive, transparent, and efficient financing platform. Farmers can access
                                            capital with 4-6% interest, without requiring bank accounts, with processes
                                            completed in minutes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Hedera */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Why Hedera?</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card text-center">
                                <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Fast & Cheap</h3>
                                <p className="text-gray-600">
                                    Transactions complete in 3-5 seconds with only $0.0001 fee
                                </p>
                            </div>
                            <div className="card text-center">
                                <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Secure</h3>
                                <p className="text-gray-600">
                                    aBFT consensus provides enterprise-grade security
                                </p>
                            </div>
                            <div className="card text-center">
                                <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Sustainable</h3>
                                <p className="text-gray-600">
                                    Carbon negative, supporting sustainable agriculture
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-12">Our Impact Goals</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="card">
                                <div className="text-4xl font-bold text-primary-600 mb-2">1M</div>
                                <p className="text-gray-600">Farmers onboarded by 2030</p>
                            </div>
                            <div className="card">
                                <div className="text-4xl font-bold text-primary-600 mb-2">$1B</div>
                                <p className="text-gray-600">Total loans facilitated</p>
                            </div>
                            <div className="card">
                                <div className="text-4xl font-bold text-primary-600 mb-2">50%</div>
                                <p className="text-gray-600">Reduction in financing costs</p>
                            </div>
                            <div className="card">
                                <div className="text-4xl font-bold text-primary-600 mb-2">100K</div>
                                <p className="text-gray-600">Hectares under sustainable farming</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Users className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold mb-6">Built for Hackathon</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            AgriChain Finance is a project for Hedera Hackathon,
                            developed with passion to make real impact on
                            farmers' lives worldwide.
                        </p>
                        <div className="flex justify-center gap-4">
                            <a
                                href="https://github.com/yourusername/agrichain-finance"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                View on GitHub
                            </a>
                            <a
                                href="https://docs.hedera.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                            >
                                Hedera Docs
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
