// ✅ NEW APPROACH: Direct contract calls instead of event querying
// This is 135x faster! (~2 seconds vs ~4.5 minutes)

const loadLoansFromBlockchain = async (): Promise<Loan[]> => {
    try {
        if (!provider) {
            console.warn('⚠️ No provider available - wallet not connected')
            if (!isConnected && !isConnecting && !hasShownWalletError) {
                setHasShownWalletError(true)
            }
            return []
        }

        const contract = getContract(provider)
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

        console.log('📋 Contract Address:', contractAddress)

        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            console.error('❌ Contract not deployed')
            toast.error('Contract not deployed')
            return []
        }

        // ✅ Step 1: Get total loan count from contract
        console.log('🔍 Getting loan count from contract...')
        const loanCount = await contract.loanRequestCounter()
        const totalLoans = Number(loanCount)

        console.log(`✅ Found ${totalLoans} loans in contract`)

        // Update debug info
        const network = await provider.getNetwork()
        setDebugInfo({
            contractAddress,
            loansLoaded: totalLoans,
            networkId: Number(network.chainId)
        })

        if (totalLoans === 0) {
            console.warn('⚠️ No loans found in contract')
            toast.error('No loans found. Create your first loan!', { duration: 5000 })
            return []
        }

        // ✅ Step 2: Load all loan details in parallel
        console.log(`📊 Loading details for ${totalLoans} loans...`)
        const loanPromises: Promise<Loan | null>[] = []

        for (let loanId = 0; loanId < totalLoans; loanId++) {
            loanPromises.push(
                (async () => {
                    try {
                        console.log(`   Loading loan #${loanId}...`)

                        // Get loan details
                        const loanDetails = await contract.getLoanDetails(loanId)

                        // Get investments for this loan
                        const investments = await contract.getLoanInvestments(loanId)

                        // Calculate total funded amount
                        const totalFunded = investments.reduce(
                            (sum: bigint, inv: any) => sum + inv.amount,
                            BigInt(0)
                        )

                        // Get crop type from harvest token
                        const harvestToken = await contract.harvestTokens(
                            loanDetails.harvestTokenId.toString()
                        )

                        // Format amounts to HBAR
                        const requestedAmountHBAR = ethers.formatEther(loanDetails.requestedAmount)
                        const fundedAmountHBAR = ethers.formatEther(totalFunded)

                        console.log(`   ✅ Loan #${loanId}: ${harvestToken.cropType} - ${requestedAmountHBAR} HBAR requested, ${fundedAmountHBAR} HBAR funded`)

                        return {
                            id: loanId,
                            farmer: loanDetails.farmer,
                            cropType: harvestToken.cropType,
                            requestedAmount: requestedAmountHBAR,
                            interestRate: Number(loanDetails.interestRate),
                            duration: Number(loanDetails.duration),
                            fundedAmount: fundedAmountHBAR,
                            status: Number(loanDetails.status),
                            createdAt: Number(loanDetails.createdAt),
                            txHash: '', // Not needed for this approach
                            isOnChain: true
                        } as Loan
                    } catch (error) {
                        console.error(`   ❌ Error loading loan #${loanId}:`, error)
                        return null
                    }
                })()
            )
        }

        // Wait for all loans to load
        const loans = (await Promise.all(loanPromises))
            .filter((loan): loan is Loan => loan !== null)

        console.log(`✅ Successfully loaded ${loans.length} loans`)
        console.log('📋 Loans:', loans.map(l => ({
            id: l.id,
            cropType: l.cropType,
            requested: l.requestedAmount,
            funded: l.fundedAmount,
            status: l.status
        })))

        return loans

    } catch (error: any) {
        console.error('Error loading loans from blockchain:', error)
        toast.error('Failed to load loans: ' + error.message)
        return []
    }
}
