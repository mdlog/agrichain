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

    console.log("🔐 Authorizing AgriChainFinance Contract...\n");

    console.log("📋 Configuration:");
    console.log("HarvestTokenNFT:", HARVEST_NFT_CONTRACT);
    console.log("AgriChainFinance:", AGRICHAIN_CONTRACT);
    console.log("");

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log("Authorizing with account:", signer.address);

    // Attach to HarvestTokenNFT contract
    const HarvestTokenNFT = await hre.ethers.getContractFactory("HarvestTokenNFT");
    const harvestNFT = HarvestTokenNFT.attach(HARVEST_NFT_CONTRACT);

    // Check current authorization
    console.log("\n📝 Checking current authorization...");
    const isAuthorizedBefore = await harvestNFT.authorizedContracts(AGRICHAIN_CONTRACT);
    console.log("Currently authorized:", isAuthorizedBefore);

    if (isAuthorizedBefore) {
        console.log("✅ Contract is already authorized!");
        return;
    }

    // Authorize contract
    console.log("\n📝 Authorizing contract...");
    const tx = await harvestNFT.authorizeContract(AGRICHAIN_CONTRACT);
    console.log("Transaction sent:", tx.hash);

    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Verify authorization
    console.log("\n📝 Verifying authorization...");
    const isAuthorizedAfter = await harvestNFT.authorizedContracts(AGRICHAIN_CONTRACT);
    console.log("Now authorized:", isAuthorizedAfter);

    if (isAuthorizedAfter) {
        console.log("\n" + "=".repeat(60));
        console.log("🎉 AUTHORIZATION SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log("\n✅ AgriChainFinance can now manage HTS NFTs");
        console.log("\n📝 NEXT STEPS:");
        console.log("1. Update frontend/.env.local with contract addresses");
        console.log("2. Copy contract ABIs to frontend/contracts/");
        console.log("3. Test the integration with test script");
        console.log("\n" + "=".repeat(60) + "\n");
    } else {
        console.error("\n❌ Authorization failed! Please check and try again.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Authorization failed:", error);
        process.exit(1);
    });
