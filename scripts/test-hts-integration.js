const hre = require("hardhat");

async function main() {
    const HARVEST_NFT_CONTRACT = process.env.HARVEST_NFT_CONTRACT || "";
    const AGRICHAIN_CONTRACT = process.env.AGRICHAIN_CONTRACT || "";

    if (!HARVEST_NFT_CONTRACT || !AGRICHAIN_CONTRACT) {
        console.error("❌ ERROR: Contract addresses not set!");
        console.log("\n📝 Please set environment variables:");
        console.log("  export HARVEST_NFT_CONTRACT=0xYourHarvestNFTAddress");
        console.log("  export AGRICHAIN_CONTRACT=0xYourAgriChainAddress\n");
        process.exit(1);
    }

    console.log("🧪 Testing HTS Integration...\n");
    console.log("=".repeat(60));

    // Attach to contracts
    const HarvestTokenNFT = await hre.ethers.getContractFactory("HarvestTokenNFT");
    const harvestNFT = HarvestTokenNFT.attach(HARVEST_NFT_CONTRACT);

    const AgriChainFinance = await hre.ethers.getContractFactory("AgriChainFinance");
    const agriChain = AgriChainFinance.attach(AGRICHAIN_CONTRACT);

    let allTestsPassed = true;

    // Test 1: Check HarvestTokenNFT deployment
    console.log("\n📝 Test 1: HarvestTokenNFT Deployment");
    console.log("-".repeat(60));
    try {
        const owner = await harvestNFT.owner();
        const totalNFTs = await harvestNFT.getTotalNFTs();

        console.log("✅ Contract deployed");
        console.log("   Owner:", owner);
        console.log("   Total NFTs:", totalNFTs.toString());
    } catch (error) {
        console.log("❌ Test failed:", error.message);
        allTestsPassed = false;
    }

    // Test 2: Check AgriChainFinance deployment
    console.log("\n📝 Test 2: AgriChainFinance Deployment");
    console.log("-".repeat(60));
    try {
        const owner = await agriChain.owner();
        const nftContract = await agriChain.harvestNFTContract();
        const totalLoans = await agriChain.loanRequestCounter();

        console.log("✅ Contract deployed");
        console.log("   Owner:", owner);
        console.log("   NFT Contract:", nftContract);
        console.log("   Total Loans:", totalLoans.toString());
    } catch (error) {
        console.log("❌ Test failed:", error.message);
        allTestsPassed = false;
    }

    // Test 3: Check contract reference
    console.log("\n📝 Test 3: Contract Reference");
    console.log("-".repeat(60));
    try {
        const nftContractAddress = await agriChain.harvestNFTContract();
        const matches = nftContractAddress.toLowerCase() === HARVEST_NFT_CONTRACT.toLowerCase();

        if (matches) {
            console.log("✅ Reference matches");
            console.log("   Expected:", HARVEST_NFT_CONTRACT);
            console.log("   Actual:", nftContractAddress);
        } else {
            console.log("❌ Reference mismatch!");
            console.log("   Expected:", HARVEST_NFT_CONTRACT);
            console.log("   Actual:", nftContractAddress);
            allTestsPassed = false;
        }
    } catch (error) {
        console.log("❌ Test failed:", error.message);
        allTestsPassed = false;
    }

    // Test 4: Check authorization
    console.log("\n📝 Test 4: Contract Authorization");
    console.log("-".repeat(60));
    try {
        const isAuthorized = await harvestNFT.authorizedContracts(AGRICHAIN_CONTRACT);

        if (isAuthorized) {
            console.log("✅ AgriChainFinance is authorized");
        } else {
            console.log("❌ AgriChainFinance is NOT authorized!");
            console.log("   Run: npx hardhat run scripts/authorize-contract.js --network hedera_testnet");
            allTestsPassed = false;
        }
    } catch (error) {
        console.log("❌ Test failed:", error.message);
        allTestsPassed = false;
    }

    // Test 5: Check verification levels
    console.log("\n📝 Test 5: Verification Levels");
    console.log("-".repeat(60));
    try {
        const [signer] = await hre.ethers.getSigners();
        const level = await agriChain.getVerificationLevel(signer.address);
        const maxLoan = await agriChain.getMaxLoanAmount(signer.address);

        console.log("✅ Verification system working");
        console.log("   Your level:", level.toString());
        console.log("   Max loan:", hre.ethers.formatEther(maxLoan), "HBAR");
    } catch (error) {
        console.log("❌ Test failed:", error.message);
        allTestsPassed = false;
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    if (allTestsPassed) {
        console.log("🎉 ALL TESTS PASSED!");
        console.log("=".repeat(60));
        console.log("\n✅ HTS integration is working correctly");
        console.log("\n📝 NEXT STEPS:");
        console.log("1. Update frontend/.env.local with contract addresses");
        console.log("2. Copy contract ABIs to frontend/contracts/");
        console.log("3. Test creating NFTs via API");
        console.log("4. Test creating loans with HTS NFTs");
    } else {
        console.log("❌ SOME TESTS FAILED");
        console.log("=".repeat(60));
        console.log("\n⚠️  Please fix the issues above and try again");
    }
    console.log("\n" + "=".repeat(60) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
