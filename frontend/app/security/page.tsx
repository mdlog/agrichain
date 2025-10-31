import { Shield, CheckCircle, AlertTriangle, Lock, Eye, Users, Satellite, Cpu } from 'lucide-react'
import Link from 'next/link'

export default function Security() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <Shield className="w-20 h-20 mx-auto mb-6" />
                    <h1 className="text-5xl font-bold mb-6">Investor Protection & Security</h1>
                    <p className="text-xl max-w-3xl mx-auto text-primary-100">
                        Multi-layered verification system to protect your investments and ensure farmer authenticity
                    </p>
                </div>
            </section>

            {/* Verification Levels */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">Farmer Verification Levels</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <VerificationCard
                            level="1"
                            title="Basic"
                            badge="🥉"
                            color="gray"
                            features={[
                                'Wallet verified',
                                'Collateral validated',
                                'Max 70% LTV'
                            ]}
                            interest="5-7%"
                            maxLoan="$2,000"
                        />

                        <VerificationCard
                            level="2"
                            title="Verified"
                            badge="🥈"
                            color="blue"
                            features={[
                                'KYC completed',
                                'Land ownership verified',
                                'Phone verified'
                            ]}
                            interest="4-6%"
                            maxLoan="$5,000"
                        />

                        <VerificationCard
                            level="3"
                            title="Premium"
                            badge="🥇"
                            color="yellow"
                            features={[
                                'Satellite verified',
                                'IoT sensors active',
                                '3+ successful loans',
                                'Credit score > 700'
                            ]}
                            interest="3-5%"
                            maxLoan="$20,000"
                        />

                        <VerificationCard
                            level="4"
                            title="Elite"
                            badge="💎"
                            color="purple"
                            features={[
                                '10+ successful loans',
                                'Credit score > 850',
                                'Community endorsed',
                                'Insurance covered'
                            ]}
                            interest="2-4%"
                            maxLoan="Unlimited"
                        />
                    </div>
                </div>
            </section>

            {/* Verification Methods */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12">How We Verify Farmers</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <MethodCard
                            icon={<Lock className="w-12 h-12" />}
                            title="KYC Verification"
                            description="Government ID, land ownership documents, and biometric verification"
                        />

                        <MethodCard
                            icon={<Satellite className="w-12 h-12" />}
                            title="Satellite Imagery"
                            description="Real-time crop monitoring and land verification using satellite data"
                        />

                        <MethodCard
                            icon={<Cpu className="w-12 h-12" />}
                            title="IoT Sensors"
                            description="Field sensors monitoring soil, weather, and crop health in real-time"
                        />

                        <MethodCard
                            icon={<Users className="w-12 h-12" />}
                            title="Community Validation"
                            description="Local agricultural cooperatives verify and endorse farmers"
                        />
                    </div>
                </div>
            </section>

            {/* Credit Scoring */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">On-Chain Credit Scoring</h2>

                        <div className="card">
                            <p className="text-gray-600 mb-6">
                                Every farmer has a transparent credit score based on their on-chain history:
                            </p>

                            <div className="space-y-4">
                                <ScoreItem label="Repayment History" weight="40%" description="On-time payments increase score" />
                                <ScoreItem label="Loan-to-Value Ratio" weight="20%" description="Conservative borrowing is rewarded" />
                                <ScoreItem label="Time on Platform" weight="15%" description="Longer history builds trust" />
                                <ScoreItem label="Verification Level" weight="15%" description="Higher verification = higher score" />
                                <ScoreItem label="Community Reputation" weight="10%" description="Peer endorsements matter" />
                            </div>

                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <p className="text-sm text-primary-800">
                                    <strong>Transparent & Immutable:</strong> All credit scores are calculated on-chain and cannot be manipulated.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Anti-Fraud */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Anti-Fraud Measures</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card">
                                <AlertTriangle className="w-10 h-10 text-yellow-600 mb-4" />
                                <h3 className="text-xl font-bold mb-3">Duplicate Detection</h3>
                                <p className="text-gray-600">
                                    GPS coordinates prevent farmers from claiming the same land multiple times
                                </p>
                            </div>

                            <div className="card">
                                <Eye className="w-10 h-10 text-blue-600 mb-4" />
                                <h3 className="text-xl font-bold mb-3">Harvest Validation</h3>
                                <p className="text-gray-600">
                                    AI validates harvest claims against regional averages and satellite data
                                </p>
                            </div>

                            <div className="card">
                                <Cpu className="w-10 h-10 text-purple-600 mb-4" />
                                <h3 className="text-xl font-bold mb-3">Behavioral Analysis</h3>
                                <p className="text-gray-600">
                                    Machine learning detects suspicious patterns and fraudulent behavior
                                </p>
                            </div>

                            <div className="card">
                                <Shield className="w-10 h-10 text-green-600 mb-4" />
                                <h3 className="text-xl font-bold mb-3">Blacklist System</h3>
                                <p className="text-gray-600">
                                    Automatic blacklisting for defaulters and fraudulent accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Insurance */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Crop Insurance (Coming Soon)</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Additional protection for investors through integrated crop insurance
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="card">
                                <h3 className="font-bold mb-2">Crop Failure</h3>
                                <p className="text-sm text-gray-600">Coverage for natural disasters and crop diseases</p>
                            </div>
                            <div className="card">
                                <h3 className="font-bold mb-2">Price Protection</h3>
                                <p className="text-sm text-gray-600">Insurance against market price drops</p>
                            </div>
                            <div className="card">
                                <h3 className="font-bold mb-2">Default Protection</h3>
                                <p className="text-sm text-gray-600">Partial coverage for farmer defaults</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk Indicators */}
            <section className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Risk Assessment for Investors</h2>

                        <div className="card">
                            <p className="text-gray-600 mb-6">
                                Every loan displays clear risk indicators to help you make informed decisions:
                            </p>

                            <div className="space-y-4">
                                <RiskIndicator
                                    label="Verification Badge"
                                    description="Level 1-4 badge showing farmer verification status"
                                    impact="High"
                                />
                                <RiskIndicator
                                    label="Credit Score"
                                    description="0-1000 score based on on-chain history"
                                    impact="High"
                                />
                                <RiskIndicator
                                    label="Success Rate"
                                    description="Percentage of successfully repaid loans"
                                    impact="High"
                                />
                                <RiskIndicator
                                    label="Collateral Ratio"
                                    description="Loan-to-value percentage (max 70%)"
                                    impact="Medium"
                                />
                                <RiskIndicator
                                    label="Insurance Status"
                                    description="Whether loan is covered by insurance"
                                    impact="Medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Invest with Confidence</h2>
                    <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
                        Our multi-layered verification system protects your investments while supporting genuine farmers
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/marketplace" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                            Browse Verified Loans
                        </Link>
                        <Link href="/investor" className="btn-secondary border-white text-white hover:bg-primary-700">
                            Investor Dashboard
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

function VerificationCard({ level, title, badge, color, features, interest, maxLoan }: {
    level: string
    title: string
    badge: string
    color: string
    features: string[]
    interest: string
    maxLoan: string
}) {
    const colorClasses = {
        gray: 'border-gray-300 bg-gray-50',
        blue: 'border-blue-300 bg-blue-50',
        yellow: 'border-yellow-300 bg-yellow-50',
        purple: 'border-purple-300 bg-purple-50'
    }

    return (
        <div className={`card border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="text-center mb-4">
                <div className="text-4xl mb-2">{badge}</div>
                <h3 className="text-xl font-bold">Level {level}</h3>
                <p className="text-lg font-semibold text-gray-700">{title}</p>
            </div>

            <ul className="space-y-2 mb-4">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-bold">{interest}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Max Loan:</span>
                    <span className="font-bold">{maxLoan}</span>
                </div>
            </div>
        </div>
    )
}

function MethodCard({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="card text-center">
            <div className="text-primary-600 flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    )
}

function ScoreItem({ label, weight, description }: {
    label: string
    weight: string
    description: string
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div className="flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="text-primary-600 font-bold">{weight}</div>
        </div>
    )
}

function RiskIndicator({ label, description, impact }: {
    label: string
    description: string
    impact: string
}) {
    const impactColors = {
        High: 'text-red-600',
        Medium: 'text-yellow-600',
        Low: 'text-green-600'
    }

    return (
        <div className="flex items-start gap-4 py-3 border-b last:border-0">
            <div className="flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className={`font-bold ${impactColors[impact as keyof typeof impactColors]}`}>
                {impact}
            </div>
        </div>
    )
}
