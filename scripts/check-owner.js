const hre = require("hardhat");

async function main() {
    console.log("=== CHECK CONTRACT OWNER ===");

    const contractAddress = process.env.CONTRACT_ADDRESS || "0xF1d284d7177D7EB4d48327ECb88cc5b08f8870bE";

    console.log("Contract Address:", contractAddress);

    // Get contract
    const AgriChainFinance = await hre.ethers.getContractFactory("AgriChainFinance");
    const contract = AgriChainFinance.attach(contractAddress);

    // Get current owner
    const owner = await contract.owner();
    console.log("\nCurrent Owner:", owner);
    console.log("Owner (lowercase):", owner.toLowerCase());

    // Get signer address
    const [signer] = await hre.ethers.getSigners();
    console.log("\nYour Address:", signer.address);
    console.log("Your Address (lowercase):", signer.address.toLowerCase());

    // Check if match
    const isOwner = owner.toLowerCase() === signer.address.toLowerCase();
    console.log("\nAre you the owner?", isOwner ? "✅ YES" : "❌ NO");

    console.log("\n=== CHECK COMPLETE ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
