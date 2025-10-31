require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: process.env.OPERATOR_KEY ? [process.env.OPERATOR_KEY] : [],
      chainId: 296
    },
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: process.env.OPERATOR_KEY ? [process.env.OPERATOR_KEY] : [],
      chainId: 296
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test"
  }
};
