const hre = require("hardhat");
const { ethers } = require("hardhat");

/**
 * Example flow demonstrating complete AgriChain Finance lifecycle
 */
async function main() {
    console.log("🌾 AgriChain Finance - Complete Flow Example\n");

    // Get signers
    const [deployer, farmer, investor1, investor2] = await ethers.getSigners();

    console.log("👥 Participants:");
    console.log("Deployer:", deployer.address);
    console.log("Farmer (Budi):", farmer.address);
    console.log("Investor 1 (Ani):", investor1.address);
    console.log("Investor 2 (Citra):", investor2.address);
    console.log("\n" + "=".repeat(60) + "\n");

    // Deploy contract
    console.log("📝 Step 1: Deploying AgriChain Finance Contract...");
    const AgriChainFinance = await ethers.getContractFactory("AgriChainFinance");
    const contract = await AgriChainFinance.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed at:", contractAddress);
    console.log("\n" + "=".repeat(60) + "\n");

    // Step 1: Farmer creates harvest token
    console.log("🌽 Step 2: Farmer Budi tokenizes corn harvest...");
    const harvestDate = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days
    const createTokenTx = await contract.connect(farmer).createHarvestToken(
        ethers.ZeroAddress,
        "Corn",
        2000,    // 2000 kg
        200000,  // $2000 in cents
        harvestDate
    );
    await createTokenTx.wait();
    console.log("✅ Harvest token created (ID: 0)");
    console.log("   Crop: Corn");
    console.log("   Expected yield: 2000 kg");
    console.log("   Estimated value: $2000");
    console.log("\n" + "=".repeat(60) + "\n");

    // Step 2: Farmer requests loan
    console.log("💰 Step 3: Farmer Budi requests loan...");
    const requestLoanTx = await contract.connect(farmer).requestLoan(
        0,       // harvestTokenId
        140000,  // $1400 (70% of $2000)
        500,     // 5% interest
        90       // 90 days
    );
    await requestLoanTx.wait();
    console.log("✅ Loan requested (ID: 0)");
    console.log("   Amount: $1400");
    console.log("   Interest: 5%");
    console.log("   Duration: 90 days");
    console.log("   Total repayment: $1470");
    console.log("\n" + "=".repeat(60) + "\n");

    // Step 3: Investors fund the loan
    console.log("🤝 Step 4: Investors fund the loan...");

    const investAmount1 = ethers.parseEther("0.7"); // Simulate $700
    const investTx1 = await contract.connect(investor1).investInLoan(0, {
        value: investAmount1
    });
    await investTx1.wait();
    console.log("✅ Investor Ani invested: 0.7 HBAR (~$700)");

    const investAmount2 = ethers.parseEther("0.7"); // Simulate $700
    const investTx2 = await contract.connect(investor2).investInLoan(0, {
        value: investAmount2
    });
    await investTx2.wait();
    console.log("✅ Investor Citra invested: 0.7 HBAR (~$700)");
    console.log("✅ Loan fully funded! Farmer received 1.4 HBAR");
    console.log("\n" + "=".repeat(60) + "\n");

    // Check loan status
    console.log("📊 Step 5: Checking loan status...");
    const loan = await contract.getLoanDetails(0);
    console.log("Loan Status:", loan.status === 1n ? "Funded ✅" : "Pending");
    console.log("Funded Amount:", ethers.formatEther(loan.fundedAmount), "HBAR");
    console.log("\n" + "=".repeat(60) + "\n");

    // Step 4: Farmer repays loan
    console.log("💸 Step 6: Farmer Budi repays loan after harvest...");
    console.log("(Simulating 90 days later...)");

    const repayAmount = ethers.parseEther("1.47"); // $1470 (principal + interest)
    const repayTx = await contract.connect(farmer).repayLoan(0, {
        value: repayAmount
    });
    await repayTx.wait();
    console.log("✅ Loan repaid: 1.47 HBAR (~$1470)");
    console.log("   Principal: $1400");
    console.log("   Interest: $70");
    console.log("\n" + "=".repeat(60) + "\n");

    // Step 5: Investors withdraw
    console.log("🎉 Step 7: Investors withdraw their returns...");

    const withdrawTx1 = await contract.connect(investor1).withdrawInvestment(0, 0);
    await withdrawTx1.wait();
    console.log("✅ Investor Ani withdrew: ~0.735 HBAR (~$735)");
    console.log("   Profit: $35 (5% return)");

    const withdrawTx2 = await contract.connect(investor2).withdrawInvestment(0, 1);
    await withdrawTx2.wait();
    console.log("✅ Investor Citra withdrew: ~0.735 HBAR (~$735)");
    console.log("   Profit: $35 (5% return)");
    console.log("\n" + "=".repeat(60) + "\n");

    // Summary
    console.log("📈 SUMMARY");
    console.log("=".repeat(60));
    console.log("Farmer Budi:");
    console.log("  - Received loan: $1400");
    console.log("  - Repaid: $1470");
    console.log("  - Harvest value: $2000");
    console.log("  - Net profit: $530 ✅");
    console.log("");
    console.log("Investor Ani:");
    console.log("  - Invested: $700");
    console.log("  - Received: $735");
    console.log("  - Profit: $35 (5% in 90 days) ✅");
    console.log("");
    console.log("Investor Citra:");
    console.log("  - Invested: $700");
    console.log("  - Received: $735");
    console.log("  - Profit: $35 (5% in 90 days) ✅");
    console.log("");
    console.log("Platform:");
    console.log("  - Total volume: $1400");
    console.log("  - Transaction fees: ~$0.01 (Hedera)");
    console.log("  - Carbon negative ✅");
    console.log("=".repeat(60));
    console.log("\n✨ AgriChain Finance - Empowering Farmers, Rewarding Investors!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
