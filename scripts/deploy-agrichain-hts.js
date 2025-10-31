const hre = require("hardhat");

async function main() {
    // ⚠️ REPLACE WITH YOUR HARVEST NFT CONTRACT ADDRESS
    const HARVEST_NFT_CONTRACT = process.env.HARVEST_NFT_CONTRACT || "0x0000000000000000000000000000000000000000";

    if (HARVEST_NFT_CONTRACT === "0x0000000000000000000000000000000000000000") {
        console.error("❌ ERROR: HARVEST_NFT_CONTRACT not set!");
        console.log("\n📝 Please set the HarvestTokenNFT contract address:");
        console.log("Option 1: Set environment variable");
        console.log("  export HARVEST_NFT_CONTRACT=0xYourAddress");
        console.log("\nOption 2: Edit this file and replace the address\n");
        process.exit(1);
    }

    console.log("🚀 Deploying AgriChainFinance with HTS Support...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "HBAR\n");

    console.log("📋 Configuration:");
    console.log("HarvestTokenNFT:", HARVEST_NFT_CONTRACT);
    console.log("");

    // Deploy AgriChainFinance
    console.log("📝 Deploying AgriChainFinance...");
    const AgriChainFinance = await hre.ethers.getContractFactory("AgriChainFinance");
    const agriChain = await AgriChainFinance.deploy(HARVEST_NFT_CONTRACT);

    await agriChain.waitForDeployment();

    const address = await agriChain.getAddress();

    console.log("✅ AgriChainFinance deployed to:", address);
    console.log("📋 Contract owner:", await agriChain.owner());
    console.log("📊 HarvestNFT reference:", await agriChain.harvestNFTContract());
    console.log("📊 Total loans:", (await agriChain.loanRequestCounter()).toString());

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("\n📝 NEXT STEPS:");
    console.log("1. Save this address:", address);
    console.log("2. Run authorization script:");
    console.log("   export HARVEST_NFT_CONTRACT=" + HARVEST_NFT_CONTRACT);
    console.log("   export AGRICHAIN_CONTRACT=" + address);
    console.log("   npx hardhat run scripts/authorize-contract.js --network hedera_testnet");
    console.log("\n3. Update frontend/.env.local:");
    console.log("   NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
    console.log("   NEXT_PUBLIC_HARVEST_NFT_CONTRACT=" + HARVEST_NFT_CONTRACT);
    console.log("\n" + "=".repeat(60) + "\n");

    return address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
