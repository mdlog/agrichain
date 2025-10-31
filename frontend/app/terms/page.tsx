export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="card">
                    <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
                    <p className="text-gray-600 mb-8">Last updated: January 2025</p>

                    <div className="space-y-6 text-gray-700">
                        <section>
                            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using AgriChain Finance ("the Platform"), you accept and agree to
                                be bound by these Terms of Service. If you do not agree to these terms, please do
                                not use the Platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">2. Description of Service</h2>
                            <p>
                                AgriChain Finance is a decentralized platform that connects farmers seeking financing
                                with investors through smart contracts on the Hedera blockchain. The Platform facilitates:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Tokenization of agricultural harvest as collateral</li>
                                <li>Peer-to-peer lending between farmers and investors</li>
                                <li>Automated loan repayment through smart contracts</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">3. Eligibility</h2>
                            <p className="mb-2">To use the Platform, you must:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Be at least 18 years of age</li>
                                <li>Have the legal capacity to enter into binding contracts</li>
                                <li>Not be prohibited from using the Platform under applicable laws</li>
                                <li>Have a compatible cryptocurrency wallet</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">4. User Responsibilities</h2>

                            <h3 className="text-xl font-semibold mb-2">4.1 For Farmers</h3>
                            <p className="mb-2">As a farmer using the Platform, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Provide accurate information about your harvest and collateral</li>
                                <li>Use loan funds for legitimate agricultural purposes</li>
                                <li>Make timely repayments according to loan terms</li>
                                <li>Maintain adequate insurance for your crops (where applicable)</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 For Investors</h3>
                            <p className="mb-2">As an investor using the Platform, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Conduct your own due diligence before investing</li>
                                <li>Understand the risks associated with agricultural lending</li>
                                <li>Not manipulate or attempt to manipulate the Platform</li>
                                <li>Comply with all applicable securities laws</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">5. Risks and Disclaimers</h2>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                                <p className="font-semibold text-yellow-800 mb-2">⚠️ Important Risk Disclosure</p>
                                <p className="text-yellow-700 text-sm">
                                    Agricultural lending carries significant risks. You may lose some or all of your investment.
                                </p>
                            </div>

                            <p className="mb-2">Risks include but are not limited to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Crop failure due to weather, pests, or disease</li>
                                <li>Market price fluctuations</li>
                                <li>Borrower default</li>
                                <li>Smart contract vulnerabilities</li>
                                <li>Blockchain network issues</li>
                                <li>Regulatory changes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">6. Smart Contracts</h2>
                            <p>
                                All transactions on the Platform are executed through smart contracts on the Hedera
                                blockchain. Once a transaction is confirmed on the blockchain, it cannot be reversed.
                                You are responsible for:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Verifying transaction details before confirmation</li>
                                <li>Maintaining the security of your wallet and private keys</li>
                                <li>Understanding how smart contracts work</li>
                                <li>Paying applicable blockchain transaction fees</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">7. Fees</h2>
                            <p>
                                The Platform may charge fees for certain services. Current fees include:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Platform fee: 0.5% of funded loan amount (future implementation)</li>
                                <li>Hedera network transaction fees (paid directly to network)</li>
                            </ul>
                            <p className="mt-2">
                                Fees are subject to change with notice. Current fee structure will be displayed
                                before transaction confirmation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">8. Intellectual Property</h2>
                            <p>
                                The Platform, including its design, code, and content, is protected by intellectual
                                property rights. You may not copy, modify, or distribute any part of the Platform
                                without our express written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">9. Limitation of Liability</h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AGRICHAIN FINANCE SHALL NOT BE LIABLE FOR
                                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
                                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">10. Indemnification</h2>
                            <p>
                                You agree to indemnify and hold harmless AgriChain Finance and its affiliates from
                                any claims, damages, losses, liabilities, and expenses arising from your use of the
                                Platform or violation of these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">11. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your access to the Platform at any time,
                                with or without cause, with or without notice. Upon termination, your right to use
                                the Platform will immediately cease.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">12. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the
                                jurisdiction in which AgriChain Finance operates, without regard to its conflict
                                of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">13. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. We will notify users of
                                material changes by posting the updated Terms on the Platform. Your continued use
                                of the Platform after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-3">14. Contact Information</h2>
                            <p>
                                For questions about these Terms, please contact us at:
                            </p>
                            <p className="mt-2">
                                Email: <a href="mailto:legal@agrichain.finance" className="text-primary-600 hover:underline">legal@agrichain.finance</a>
                            </p>
                        </section>

                        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600">
                                By using AgriChain Finance, you acknowledge that you have read, understood, and
                                agree to be bound by these Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
