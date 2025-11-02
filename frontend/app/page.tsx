import Link from 'next/link'
import { Sprout, TrendingUp, Shield, Zap, Users, Globe } from 'lucide-react'

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            🌾 AgriChain Finance
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Global Decentralized Agricultural Financing Platform
                        </p>
                        <p className="text-lg mb-10 text-primary-50">
                            Connecting farmers worldwide with investors through Hedera blockchain technology.
                            Access capital without banks, transparent, and low cost.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/farmer" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                                I'm a Farmer
                            </Link>
                            <Link href="/investor" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                                I'm an Investor
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold text-primary-600">$0.0001</div>
                            <div className="text-gray-600">Transaction Fee</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">3-5s</div>
                            <div className="text-gray-600">Finality</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">70%</div>
                            <div className="text-gray-600">Max Loan</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-600">4-6%</div>
                            <div className="text-gray-600">Return Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Why AgriChain?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Sprout className="w-12 h-12" />}
                            title="Harvest Tokenization"
                            description="Farmers can create tokens representing future harvest as loan collateral."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-12 h-12" />}
                            title="Competitive Returns"
                            description="Investors earn 4-6% returns in 60-120 days with measured risk."
                        />
                        <FeatureCard
                            icon={<Shield className="w-12 h-12" />}
                            title="Transparent & Secure"
                            description="All transactions recorded on Hedera blockchain with enterprise-grade security."
                        />
                        <FeatureCard
                            icon={<Zap className="w-12 h-12" />}
                            title="Fast & Cheap"
                            description="Transactions complete in 3-5 seconds with only $0.0001 per transaction."
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12" />}
                            title="Financial Inclusion"
                            description="Access to financing for farmers without bank accounts or physical collateral."
                        />
                        <FeatureCard
                            icon={<Globe className="w-12 h-12" />}
                            title="Carbon Negative"
                            description="Hedera is a carbon negative blockchain, supporting sustainable agriculture."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            <Step
                                number="1"
                                title="Farmer Tokenizes Harvest"
                                description="Farmers create tokens representing future harvest (corn, rice, etc.) with estimated value."
                            />
                            <Step
                                number="2"
                                title="Request Loan"
                                description="Farmers request loans up to 70% of harvest value with competitive interest rates."
                            />
                            <Step
                                number="3"
                                title="Investors Fund"
                                description="Investors can choose which loans to fund. Multiple investors can fund a single loan."
                            />
                            <Step
                                number="4"
                                title="Farmer Receives Funds"
                                description="Once loan is fully funded, farmers immediately receive funds for farming capital."
                            />
                            <Step
                                number="5"
                                title="Harvest & Repayment"
                                description="After harvest, farmers repay the loan plus interest through smart contract."
                            />
                            <Step
                                number="6"
                                title="Investor Withdraws Profit"
                                description="Investors withdraw their investment plus profit automatically through smart contract."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
                    <p className="text-xl mb-8 text-primary-100">
                        Join the better agricultural financing ecosystem
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/marketplace" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                            View Marketplace
                        </Link>
                        <Link href="/about" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="text-primary-600 flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {number}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    )
}
