// const { ethers } = require("hardhat");
// require('dotenv').config();

// async function main() {
//     const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    
//     if (!CONTRACT_ADDRESS) {
//         console.error("❌ CONTRACT_ADDRESS not set in .env");
//         process.exit(1);
//     }
    
//     // Get contract instance
//     const GameNFT = await ethers.getContractFactory("GameNFT");
//     const gameNFT = GameNFT.attach(CONTRACT_ADDRESS);
    
//     console.log("🎮 Crane Game NFT Marketplace");
//     console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
    
//     // Get command line arguments
//     const args = process.argv.slice(2);
//     const command = args[0];
    
//     switch (command) {
//         case 'list':
//             await listNFT(args[1], args[2]); // tokenId, price
//             break;
//         case 'buy':
//             await buyNFT(args[1]); // tokenId
//             break;
//         case 'price':
//             await updatePrice(args[1], args[2]); // tokenId, newPrice
//             break;
//         case 'remove':
//             await removeFromSale(args[1]); // tokenId
//             break;
//         case 'info':
//             await getNFTInfo(args[1]); // tokenId
//             break;
//         case 'market':
//             await getMarketplaceInfo();
//             break;
//         case 'approve':
//             await approveContract(args[1]); // tokenId
//             break;
//         case 'approve-all':
//             await approveAll();
//             break;
//         default:
//             console.log("📋 Available commands:");
//             console.log("  list <tokenId> <price>     - List NFT for sale");
//             console.log("  buy <tokenId>              - Buy NFT");
//             console.log("  price <tokenId> <newPrice> - Update NFT price");
//             console.log("  remove <tokenId>           - Remove NFT from sale");
//             console.log("  info <tokenId>             - Get NFT info");
//             console.log("  market                     - Show all NFTs for sale");
//             console.log("  approve <tokenId>          - Approve contract for specific NFT");
//             console.log("  approve-all                - Approve contract for all NFTs");
//             console.log("\n💡 Example: node scripts/marketplace.js list 1 1000000000000000000");
//     }
    
//     async function listNFT(tokenId, price) {
//         try {
//             console.log(`📝 Listing NFT #${tokenId} for ${ethers.formatEther(price)} MATIC`);
            
//             // First approve the contract
//             await approveContract(tokenId);
            
//             const tx = await gameNFT.listForSale(tokenId, price);
//             await tx.wait();
            
//             console.log(`✅ NFT #${tokenId} listed for sale!`);
//             console.log(`🔗 Transaction: https://www.oklink.com/amoy/tx/${tx.hash}`);
//         } catch (error) {
//             console.error(`❌ Error listing NFT: ${error.message}`);
//         }
//     }
    
//     async function buyNFT(tokenId) {
//         try {
//             const price = await gameNFT.getNFTPrice(tokenId);
//             console.log(`🛒 Buying NFT #${tokenId} for ${ethers.formatEther(price)} MATIC`);
            
//             const tx = await gameNFT.buyNFT(tokenId, { value: price });
//             await tx.wait();
            
//             console.log(`✅ NFT #${tokenId} purchased successfully!`);
//             console.log(`🔗 Transaction: https://www.oklink.com/amoy/tx/${tx.hash}`);
//         } catch (error) {
//             console.error(`❌ Error buying NFT: ${error.message}`);
//         }
//     }
    
//     async function updatePrice(tokenId, newPrice) {
//         try {
//             console.log(`💰 Updating price for NFT #${tokenId} to ${ethers.formatEther(newPrice)} MATIC`);
            
//             const tx = await gameNFT.updatePrice(tokenId, newPrice);
//             await tx.wait();
            
//             console.log(`✅ Price updated successfully!`);
//             console.log(`🔗 Transaction: https://www.oklink.com/amoy/tx/${tx.hash}`);
//         } catch (error) {
//             console.error(`❌ Error updating price: ${error.message}`);
//         }
//     }
    
//     async function removeFromSale(tokenId) {
//         try {
//             console.log(`🚫 Removing NFT #${tokenId} from sale`);
            
//             const tx = await gameNFT.removeFromSale(tokenId);
//             await tx.wait();
            
//             console.log(`✅ NFT #${tokenId} removed from sale!`);
//             console.log(`🔗 Transaction: https://www.oklink.com/amoy/tx/${tx.hash}`);
//         } catch (error) {
//             console.error(`❌ Error removing from sale: ${error.message}`);
//         }
//     }
    
//     async function getNFTInfo(tokenId) {
//         try {
//             const [owner, price, forSale, tokenURI] = await Promise.all([
//                 gameNFT.ownerOf(tokenId),
//                 gameNFT.getNFTPrice(tokenId),
//                 gameNFT.isNFTForSale(tokenId),
//                 gameNFT.tokenURI(tokenId)
//             ]);
            
//             console.log(`📊 NFT #${tokenId} Information:`);
//             console.log(`   Owner: ${owner}`);
//             console.log(`   Price: ${ethers.formatEther(price)} MATIC`);
//             console.log(`   For Sale: ${forSale ? 'Yes' : 'No'}`);
//             console.log(`   Token URI: ${tokenURI}`);
//         } catch (error) {
//             console.error(`❌ Error getting NFT info: ${error.message}`);
//         }
//     }
    
//     async function getMarketplaceInfo() {
//         try {
//             const [tokenIds, prices] = await gameNFT.getAllNFTsForSale();
            
//             console.log("🏪 NFTs Currently For Sale:");
//             if (tokenIds.length === 0) {
//                 console.log("   No NFTs currently for sale");
//             } else {
//                 for (let i = 0; i < tokenIds.length; i++) {
//                     console.log(`   NFT #${tokenIds[i]}: ${ethers.formatEther(prices[i])} MATIC`);
//                 }
//             }
//         } catch (error) {
//             console.error(`❌ Error getting marketplace info: ${error.message}`);
//         }
//     }
    
//     async function approveContract(tokenId) {
//         try {
//             console.log(`✅ Approving contract for NFT #${tokenId}`);
            
//             const tx = await gameNFT.approve(CONTRACT_ADDRESS, tokenId);
//             await tx.wait();
            
//             console.log(`✅ Contract approved for NFT #${tokenId}!`);
//         } catch (error) {
//             console.error(`❌ Error approving contract: ${error.message}`);
//         }
//     }
    
//     async function approveAll() {
//         try {
//             console.log("✅ Approving contract for all NFTs");
            
//             const tx = await gameNFT.setApprovalForAll(CONTRACT_ADDRESS, true);
//             await tx.wait();
            
//             console.log("✅ Contract approved for all NFTs!");
//         } catch (error) {
//             console.error(`❌ Error approving all: ${error.message}`);
//         }
//     }
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error("❌ Script failed:", error);
//         process.exit(1);
//     }); 