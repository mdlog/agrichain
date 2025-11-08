#!/usr/bin/env python3
import re

# Read the file
with open('app/farmer/page.tsx', 'r') as f:
    content = f.read()

# 1. Update activeTab type
content = content.replace(
    "useState<'create' | 'loans'>('create')",
    "useState<'create' | 'loans' | 'nfts'>('create')"
)

# 2. Add selectedNFTForLoan state (if not exists)
if 'selectedNFTForLoan' not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<'create' | 'loans' | 'nfts'>('create')",
        "const [activeTab, setActiveTab] = useState<'create' | 'loans' | 'nfts'>('create')\n    const [selectedNFTForLoan, setSelectedNFTForLoan] = useState<any>(null)"
    )

# 3. Add third tab button (after My Loans button)
my_loans_button = '''                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'loans'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <List className="w-5 h-5" />
                        My Loans
                    </button>
                </div>'''

nft_tab_button = '''                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'loans'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <List className="w-5 h-5" />
                        My Loans
                    </button>
                    <button
                        onClick={() => setActiveTab('nfts')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'nfts'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <Wheat className="w-5 h-5" />
                        Harvest NFTs 🆕
                    </button>
                </div>'''

if 'Harvest NFTs' not in content:
    content = content.replace(my_loans_button, nft_tab_button)

# 4. Update content rendering
old_content_render = '''{activeTab === 'create' ? <CreateLoanForm onSuccess={addLoanToHistory} isSubmitting={isSubmitting} /> : <MyLoans loans={farmerLoans} provider={provider} account={account} blockchainLoans={blockchainLoans} setBlockchainLoans={setBlockchainLoans} setTotalRequested={setTotalRequested} setTotalFunded={setTotalFunded} setActiveLoansCount={setActiveLoansCount} setCompletedLoansCount={setCompletedLoansCount} />}'''

new_content_render = '''{activeTab === 'create' ? (
                    <CreateLoanForm
                        onSuccess={addLoanToHistory}
                        isSubmitting={isSubmitting}
                        provider={provider}
                        account={account}
                        selectedNFT={selectedNFTForLoan}
                        onClearNFT={() => setSelectedNFTForLoan(null)}
                    />
                ) : activeTab === 'loans' ? (
                    <MyLoans loans={farmerLoans} provider={provider} account={account} blockchainLoans={blockchainLoans} setBlockchainLoans={setBlockchainLoans} setTotalRequested={setTotalRequested} setTotalFunded={setTotalFunded} setActiveLoansCount={setActiveLoansCount} setCompletedLoansCount={setCompletedLoansCount} />
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Wheat className="w-5 h-5" />
                                🎉 Harvest NFTs - Use as Collateral
                            </h3>
                            <p className="text-blue-800 text-sm">
                                Your harvest tokens are now real NFTs on Hedera blockchain!
                                They can be verified on HashScan, transferred between wallets,
                                and used as collateral for loans. Each NFT costs only ~0.05 HBAR (~$0.005) to create.
                                Click "Request Loan" on any active NFT to use it as collateral.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Create Harvest NFT</h3>
                                <CreateHarvestNFTForm
                                    farmerAddress={account || ''}
                                    farmerName={farmerName}
                                    onSuccess={(nft) => {
                                        toast.success('NFT created! You can now use it for loans.')
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-4">My Harvest NFTs</h3>
                                <MyHarvestNFTs
                                    farmerAddress={account || ''}
                                    onCreateLoan={(nft) => {
                                        setSelectedNFTForLoan(nft)
                                        setActiveTab('create')
                                        toast.success('NFT selected! Fill in loan details.')
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}'''

if 'Harvest NFTs - Use as Collateral' not in content:
    content = content.replace(old_content_render, new_content_render)

# Write back
with open('app/farmer/page.tsx', 'w') as f:
    f.write(content)

print("✅ NFT tab added successfully!")
print("✅ State updated")
print("✅ Tab button added")
print("✅ Content rendering updated")
