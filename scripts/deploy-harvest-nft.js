const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying HarvestTokenNFT Contract...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "HBAR\n");

    // Deploy HarvestTokenNFT
    console.log("📝 Deploying HarvestTokenNFT...");
    const HarvestTokenNFT = await hre.ethers.getContractFactory("HarvestTokenNFT");
    const harvestNFT = await HarvestTokenNFT.deploy();

    await harvestNFT.waitForDeployment();

    const address = await harvestNFT.getAddress();

    console.log("✅ HarvestTokenNFT deployed to:", address);
    console.log("📋 Contract owner:", await harvestNFT.owner());
    console.log("📊 Total NFTs:", (await harvestNFT.getTotalNFTs()).toString());

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Save this address:", address);
    console.log("2. Update scripts/deploy-agrichain-hts.js with this address");
    console.log("3. Run: npx hardhat run scripts/deploy-agrichain-hts.js --network hedera_testnet");
    console.log("\n" + "=".repeat(60) + "\n");

    return address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
