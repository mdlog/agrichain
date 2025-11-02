const { ethers } = require('ethers')
require('dotenv').config()

// Contract ABI untuk query events
const CONTRACT_ABI = [
    'event LoanRequested(uint256 indexed loanId, address indexed farmer, uint256 amount)',
    'event LoanFunded(uint256 indexed loanId, address indexed investor, uint256 amount)',
    'event LoanRepaid(uint256 indexed loanId, uint256 amount)',
    'function loanRequestCounter() view returns (uint256)',
    'function getLoanDetails(uint256 _loanId) view returns (tuple(uint256 id, address farmer, uint256 harvestTokenId, uint256 requestedAmount, uint256 interestRate, uint256 duration, uint256 collateralValue, uint8 status, uint256 fundedAmount, uint256 createdAt))'
]

// Hedera Testnet RPC
const RPC_URL = 'https://testnet.hashio.io/api'

async function checkContractLoans(contractAddress) {
    console.log('\n🔍 Checking Contract for Loans')
    console.log('='.repeat(60))
    console.log(`Contract Address: ${contractAddress}`)
    console.log(`RPC URL: ${RPC_URL}`)
    console.log('='.repeat(60))

    try {
        // Connect to provider
        const provider = new ethers.JsonRpcProvider(RPC_URL)
        
        // Get current block
        const currentBlock = await provider.getBlockNumber()
        console.log(`\n📊 Current Block: ${currentBlock}`)
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider)
        
        // Check if contract is deployed
        try {
            const loanCounter = await contract.loanRequestCounter()
            console.log(`\n✅ Contract is deployed`)
            console.log(`   Total Loans Created: ${loanCounter.toString()}`)
        } catch (error) {
            console.error(`\n❌ Error accessing contract:`)
            console.error(`   ${error.message}`)
            console.error(`\n💡 Possible causes:`)
            console.error(`   1. Contract address is incorrect`)
            console.error(`   2. Contract is not deployed at this address`)
            console.error(`   3. Network mismatch`)
            return
        }
        
        // Query LoanRequested events
        console.log(`\n🔍 Querying LoanRequested events...`)
        
        // Try multiple block ranges
        const blockRanges = [
            { from: Math.max(0, currentBlock - 50000), to: 'latest', name: 'Last 50,000 blocks' },
            { from: Math.max(0, currentBlock - 100000), to: 'latest', name: 'Last 100,000 blocks' },
            { from: 0, to: 'latest', name: 'All blocks' }
        ]
        
        let eventsFound = []
        
        for (const range of blockRanges) {
            try {
                console.log(`\n   Trying: ${range.name} (${range.from} to ${range.to})`)
                const filter = contract.filters.LoanRequested()
                const events = await contract.queryFilter(filter, range.from, range.to)
                
                if (events.length > 0) {
                    console.log(`   ✅ Found ${events.length} event(s) in this range!`)
                    eventsFound = events
                    break
                } else {
                    console.log(`   ⚠️  No events found in this range`)
                }
            } catch (error) {
                console.log(`   ❌ Error querying range: ${error.message}`)
            }
        }
        
        if (eventsFound.length === 0) {
            console.log(`\n❌ No LoanRequested events found in any block range`)
            console.log(`\n💡 Possible reasons:`)
            console.log(`   1. No loans have been created yet`)
            console.log(`   2. Loans were created before deployment (contract was upgraded)`)
            console.log(`   3. Events are indexed incorrectly`)
            console.log(`   4. Wrong contract address`)
            
            // Check if we can query loan counter directly
            try {
                const loanCounter = await contract.loanRequestCounter()
                if (loanCounter > 0) {
                    console.log(`\n⚠️  WARNING: loanRequestCounter shows ${loanCounter} loans, but no events found!`)
                    console.log(`   This suggests events might not be indexed properly.`)
                    
                    // Try to get loan details directly
                    console.log(`\n🔍 Attempting to fetch loan details directly...`)
                    for (let i = 0; i < Math.min(Number(loanCounter), 10); i++) {
                        try {
                            const loanDetails = await contract.getLoanDetails(i)
                            console.log(`\n   Loan #${i}:`)
                            console.log(`     Farmer: ${loanDetails.farmer}`)
                            console.log(`     Amount: ${ethers.formatEther(loanDetails.requestedAmount)} HBAR`)
                            console.log(`     Status: ${loanDetails.status} (0=Pending, 1=Funded, 2=Repaid, 3=Defaulted)`)
                            console.log(`     Created: ${new Date(Number(loanDetails.createdAt) * 1000).toISOString()}`)
                        } catch (error) {
                            console.log(`   ⚠️  Could not fetch loan #${i}: ${error.message}`)
                        }
                    }
                }
            } catch (error) {
                console.log(`\n   Could not query loan counter: ${error.message}`)
            }
        } else {
            console.log(`\n✅ Found ${eventsFound.length} LoanRequested event(s)!\n`)
            
            // Process each event
            for (let i = 0; i < eventsFound.length; i++) {
                const event = eventsFound[i]
                console.log(`Event #${i + 1}:`)
                console.log(`  Loan ID: ${event.args[0].toString()}`)
                console.log(`  Farmer: ${event.args[1]}`)
                console.log(`  Amount: ${ethers.formatEther(event.args[2])} HBAR`)
                console.log(`  Transaction Hash: ${event.transactionHash}`)
                console.log(`  Block Number: ${event.blockNumber}`)
                
                // Try to get loan details
                try {
                    const loanId = event.args[0].toString()
                    const loanDetails = await contract.getLoanDetails(loanId)
                    console.log(`  Status: ${loanDetails.status} (0=Pending, 1=Funded, 2=Repaid, 3=Defaulted)`)
                    console.log(`  Funded Amount: ${ethers.formatEther(loanDetails.fundedAmount)} HBAR`)
                    console.log(`  Created At: ${new Date(Number(loanDetails.createdAt) * 1000).toISOString()}`)
                } catch (error) {
                    console.log(`  ⚠️  Could not fetch loan details: ${error.message}`)
                }
                console.log('')
            }
        }
        
        // Also check LoanFunded events
        console.log(`\n🔍 Checking LoanFunded events...`)
        try {
            const fundedFilter = contract.filters.LoanFunded()
            const fundedEvents = await contract.queryFilter(fundedFilter, Math.max(0, currentBlock - 50000), 'latest')
            console.log(`   Found ${fundedEvents.length} LoanFunded event(s)`)
            
            if (fundedEvents.length > 0) {
                console.log(`\n   Recent Investments:`)
                fundedEvents.slice(0, 5).forEach((event, index) => {
                    console.log(`   ${index + 1}. Loan #${event.args[0].toString()}: ${ethers.formatEther(event.args[2])} HBAR by ${event.args[1].slice(0, 10)}...`)
                })
            }
        } catch (error) {
            console.log(`   ⚠️  Error querying LoanFunded events: ${error.message}`)
        }
        
        console.log('\n' + '='.repeat(60))
        console.log('✅ Check Complete')
        
    } catch (error) {
        console.error('\n❌ Error:', error.message)
        console.error('\nFull error:', error)
    }
}

// Main execution
async function main() {
    const contractAddress = process.argv[2] || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2ad4F880481437fA'
    
    if (!contractAddress || contractAddress.length < 10) {
        console.error('❌ Please provide a valid contract address')
        console.error('Usage: node check-loans.js <contract-address>')
        console.error('Or set NEXT_PUBLIC_CONTRACT_ADDRESS in .env')
        process.exit(1)
    }
    
    // Validate address format
    if (!ethers.isAddress(contractAddress)) {
        console.error(`❌ Invalid contract address format: ${contractAddress}`)
        console.error('Please provide a valid Ethereum address (0x...)')
        process.exit(1)
    }
    
    await checkContractLoans(contractAddress)
}

main().catch(console.error)
