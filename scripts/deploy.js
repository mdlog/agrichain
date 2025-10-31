const hre = require("hardhat");

async function main() {
  console.log("Deploying AgriChainFinance contract...");

  const AgriChainFinance = await hre.ethers.getContractFactory("AgriChainFinance");
  const contract = await AgriChainFinance.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("AgriChainFinance deployed to:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Save contract address to .env file
  const fs = require('fs');
  const envPath = '.env';
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add CONTRACT_ADDRESS
  if (envContent.includes('CONTRACT_ADDRESS=')) {
    envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("Contract address saved to .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });