require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
    },
    // Optional: For mainnet later
    // polygon: {
    //   url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    //   accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
    //   chainId: 137,
    // },
  },
  etherscan: {
    apiKey: {
      amoy: "your_amoy_api_key", // Not required for Amoy testnet
    },
  },
}; 