const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI - only the functions we need
const ABI = [
    "event LoanRequested(uint256 indexed loanId, address indexed farmer, uint256 harvestTokenId, uint256 requestedAmount, uint256 interestRate, uint256 duration)",
    "event LoanFunded(uint256 indexed loanId, address indexed investor, uint256 amount)",
    "function getLoanDetails(uint256 loanId) view returns (tuple(address farmer, uint256 harvestTokenId, uint256 requestedAmount, uint256 interestRate, uint256 duration, uint256 fundedAmount, uint8 status, uint256 startTime, uint256 endTime))",
    "function loanCounter() view returns (uint256)"
];

async function checkLoans() {
    try {
        console.log('🔍 Checking loans on blockchain...\n');

        // Setup provider
        const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

        // Get contract address from env
        const contractAddress = process.env.CONTRACT_ADDRESS;
        console.log('📋 Contract Address:', contractAddress);

        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            console.error('❌ Contract address not set in .env');
            process.exit(1);
        }

        // Create contract instance
        const contract = new ethers.Contract(contractAddress, ABI, provider);

        // Get current block
        const currentBlock = await provider.getBlockNumber();
        console.log('📦 Current Block:', currentBlock);

        // Get loan counter
        try {
            const loanCounter = await contract.loanCounter();
            console.log('🔢 Total Loans Created:', loanCounter.toString());
        } catch (error) {
            console.log('⚠️ Could not get loan counter (contract might not have this function)');
        }

        console.log('\n🔍 Querying LoanRequested events...');

        // Query events from last 50000 blocks
        const fromBlock = Math.max(0, currentBlock - 50000);
        const eventFilter = contract.filters.LoanRequested();
        const events = await contract.queryFilter(eventFilter, fromBlock, 'latest');

        console.log(`✅ Found ${events.length} LoanRequested events\n`);

        if (events.length === 0) {
            console.log('📭 No loans found on blockchain');
            console.log('\n💡 Possible reasons:');
            console.log('   1. No loans have been created yet');
            console.log('   2. Loans were created more than 50000 blocks ago');
            console.log('   3. Wrong contract address');
            console.log('\n💡 Try:');
            console.log('   1. Create a loan from the Farmer page');
            console.log('   2. Check contract address in .env and frontend/.env.local');
            console.log('   3. Verify on HashScan: https://hashscan.io/testnet/contract/' + contractAddress);
            return;
        }

        // Display loan details
        for (const event of events) {
            const loanId = event.args[0].toString();
            const farmer = event.args[1];
            const harvestTokenId = event.args[2].toString();
            const requestedAmount = event.args[3];
            const interestRate = event.args[4];
            const duration = event.args[5];

            console.log(`📄 Loan #${loanId}`);
            console.log(`   Farmer: ${farmer}`);
            console.log(`   Harvest Token ID: ${harvestTokenId}`);
            console.log(`   Requested Amount: ${ethers.formatEther(requestedAmount)} HBAR`);
            console.log(`   Interest Rate: ${interestRate.toString() / 100}%`);
            console.log(`   Duration: ${duration.toString()} days`);
            console.log(`   Tx Hash: ${event.transactionHash}`);
            console.log(`   Block: ${event.blockNumber}`);

            // Get current loan details
            try {
                const details = await contract.getLoanDetails(loanId);
                console.log(`   Current Status: ${details.status === 0 ? 'Active' : details.status === 1 ? 'Funded' : 'Repaid'}`);
                console.log(`   Funded Amount: ${ethers.formatEther(details.fundedAmount)} HBAR`);
            } catch (error) {
                console.log(`   ⚠️ Could not get loan details`);
            }

            console.log('');
        }

        // Query funded events
        console.log('💰 Querying LoanFunded events...');
        const fundedFilter = contract.filters.LoanFunded();
        const fundedEvents = await contract.queryFilter(fundedFilter, fromBlock, 'latest');
        console.log(`✅ Found ${fundedEvents.length} LoanFunded events\n`);

        for (const event of fundedEvents) {
            const loanId = event.args[0].toString();
            const investor = event.args[1];
            const amount = event.args[2];

            console.log(`💵 Investment in Loan #${loanId}`);
            console.log(`   Investor: ${investor}`);
            console.log(`   Amount: ${ethers.formatEther(amount)} HBAR`);
            console.log(`   Tx Hash: ${event.transactionHash}`);
            console.log('');
        }

        console.log('✅ Check complete!');
        console.log('\n📊 Summary:');
        console.log(`   Total Loans: ${events.length}`);
        console.log(`   Total Investments: ${fundedEvents.length}`);
        console.log(`   Contract: https://hashscan.io/testnet/contract/${contractAddress}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkLoans();
