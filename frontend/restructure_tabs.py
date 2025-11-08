#!/usr/bin/env python3

# Read the file
with open('app/farmer/page.tsx', 'r') as f:
    content = f.read()

# 1. Update activeTab type - remove 'loans'
content = content.replace(
    "useState<'create' | 'loans' | 'nfts'>('create')",
    "useState<'create' | 'nfts'>('create')"
)

# 2. Remove "My Loans" tab button
my_loans_button = '''                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'loans'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <List className="w-5 h-5" />
                        My Loans
                    </button>'''

content = content.replace(my_loans_button, '')

# 3. Update content rendering to show form + list in 2 columns for 'create' tab
# Find and replace the content section
old_create_content = '''                {activeTab === 'create' ? (
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
                ) :'''

new_create_content = '''                {activeTab === 'create' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Create New Loan</h3>
                            <CreateLoanForm
                                onSuccess={addLoanToHistory}
                                isSubmitting={isSubmitting}
                                provider={provider}
                                account={account}
                                selectedNFT={selectedNFTForLoan}
                                onClearNFT={() => setSelectedNFTForLoan(null)}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">My Loans</h3>
                            <MyLoans loans={farmerLoans} provider={provider} account={account} blockchainLoans={blockchainLoans} setBlockchainLoans={setBlockchainLoans} setTotalRequested={setTotalRequested} setTotalFunded={setTotalFunded} setActiveLoansCount={setActiveLoansCount} setCompletedLoansCount={setCompletedLoansCount} />
                        </div>
                    </div>
                ) :'''

if old_create_content in content:
    content = content.replace(old_create_content, new_create_content)
    print("✅ Updated 'create' tab to show 2 columns")
else:
    print("⚠️  Could not find exact match for content section")
    # Try alternative approach
    import re
    # This is a fallback - we'll handle it manually if needed

# Write back
with open('app/farmer/page.tsx', 'w') as f:
    f.write(content)

print("✅ Tab structure updated!")
print("✅ Removed 'My Loans' tab button")
print("✅ 'Create New Loan' tab now shows form + list in 2 columns")
