const hre = require("hardhat");

async function main() {
    console.log("=== TRANSFER CONTRACT OWNERSHIP ===");

    const contractAddress = process.env.CONTRACT_ADDRESS || "0xF1d284d7177D7EB4d48327ECb88cc5b08f8870bE";

    // New owner address
    const newOwner = "0x199f289aFB43D719BD5A7E654Ff77A1c7AedefcA";

    console.log("Contract Address:", contractAddress);
    console.log("New Owner:", newOwner);

    // Get contract
    const AgriChainFinance = await hre.ethers.getContractFactory("AgriChainFinance");
    const contract = AgriChainFinance.attach(contractAddress);

    // Get current owner
    const currentOwner = await contract.owner();
    console.log("Current Owner:", currentOwner);

    // Transfer ownership
    console.log("\nTransferring ownership...");
    const tx = await contract.transferOwnership(newOwner);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("✅ Ownership transferred!");

    // Verify new owner
    const verifiedOwner = await contract.owner();
    console.log("New Owner:", verifiedOwner);
    console.log("\n=== TRANSFER COMPLETE ===");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
