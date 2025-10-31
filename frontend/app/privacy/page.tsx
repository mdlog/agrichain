export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="card">
                    <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
                    <p className="text-gray-600 mb-8">Last updated: January 2025</p>

                    <div className="space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-bold mb-3">1. Introduction</h2>
                            <p>
                                AgriChain Finance ("we", "our", or "us") is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, and safeguard your information
                                when you use our decentralized agricultural financing platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">2. Information We Collect</h2>
                            <h3 className="text-xl font-semibold mb-2">2.1 Blockchain Data</h3>
                            <p className="mb-3">
                                When you interact with our smart contracts on Hedera blockchain, certain information
                                is publicly recorded on the blockchain, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Wallet addresses</li>
                                <li>Transaction amounts</li>
                                <li>Loan requests and investments</li>
                                <li>Timestamps of transactions</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Usage Data</h3>
                            <p>
                                We may collect information about how you access and use our platform, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Browser type and version</li>
                                <li>Pages visited</li>
                                <li>Time and date of visits</li>
                                <li>IP address (anonymized)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">3. How We Use Your Information</h2>
                            <p className="mb-2">We use the collected information to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Provide and maintain our platform</li>
                                <li>Process transactions on the blockchain</li>
                                <li>Improve user experience</li>
                                <li>Detect and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your
                                information. However, no method of transmission over the Internet or electronic
                                storage is 100% secure. Blockchain transactions are immutable and publicly visible.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">5. Third-Party Services</h2>
                            <p className="mb-2">We may use third-party services including:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Hedera blockchain network</li>
                                <li>Wallet providers (HashPack, MetaMask)</li>
                                <li>Analytics services</li>
                            </ul>
                            <p className="mt-3">
                                These services have their own privacy policies. We encourage you to review them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">6. Your Rights</h2>
                            <p className="mb-2">You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Access your personal information</li>
                                <li>Request correction of inaccurate data</li>
                                <li>Request deletion of your data (where applicable)</li>
                                <li>Object to processing of your data</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                            <p className="mt-3">
                                Note: Blockchain data cannot be deleted or modified once recorded.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">7. Children's Privacy</h2>
                            <p>
                                Our platform is not intended for users under 18 years of age. We do not knowingly
                                collect information from children under 18.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">8. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any
                                changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">9. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="mt-2">
                                Email: <a href="mailto:privacy@agrichain.finance" className="text-primary-600 hover:underline">privacy@agrichain.finance</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
