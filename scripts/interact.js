const { Client, AccountId, PrivateKey, ContractExecuteTransaction, ContractCallQuery, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  // Setup Hedera client
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
  );

  const contractId = process.env.CONTRACT_ID;

  console.log("🌾 AgriChain Finance - Interaction Script\n");
  console.log("Contract ID:", contractId);
  console.log("Operator:", process.env.OPERATOR_ID);
  
  // Example: Get total value locked
  console.log("\n📊 Fetching contract data...");
  
  // Add your interaction logic here
  
  client.close();
}

main().catch(console.error);
