const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying GameNFT contract to Polygon Amoy testnet...");

  // Get the contract factory
  const GameNFT = await ethers.getContractFactory("GameNFT");
  
  // Contract parameters
  const name = "Crane Game NFT";
  const symbol = "CRANE";
  const baseURI = ""; // Empty since we use individual tokenURIs from IPFS
  
  console.log("📝 Contract parameters:");
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Base URI: ${baseURI} (not used - individual IPFS URLs stored per token)`);
  
  // Deploy the contract
  const gameNFT = await GameNFT.deploy(name, symbol, baseURI);
  
  // Wait for deployment to complete
  await gameNFT.waitForDeployment();
  
  const contractAddress = await gameNFT.getAddress();
  
  console.log("✅ GameNFT deployed successfully!");
  console.log(`📍 Contract address: ${contractAddress}`);
  console.log(`🔗 Amoy Explorer: https://www.oklink.com/amoy/address/${contractAddress}`);
  
  // Verify the deployment
  console.log("\n🔍 Verifying deployment...");
  const deployedName = await gameNFT.name();
  const deployedSymbol = await gameNFT.symbol();
  const deployedBaseURI = await gameNFT.baseURI();
  
  console.log(`   Deployed name: ${deployedName}`);
  console.log(`   Deployed symbol: ${deployedSymbol}`);
  console.log(`   Deployed base URI: ${deployedBaseURI}`);
  
  console.log("\n📋 Next steps:");
  console.log("1. Save the contract address above");
  console.log("2. Update the mint.js script with the contract address");
  console.log("3. Prepare your metadata files");
  console.log("4. Run: npm run mint");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 