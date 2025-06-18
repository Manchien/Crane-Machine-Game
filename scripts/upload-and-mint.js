const { ethers } = require("hardhat");
const { uploadNFT, batchUploadNFTs } = require('./upload-to-pinata');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });



async function uploadAndMint(imagePath, tokenId, recipientAddress, contractAddress, attributes = {}) {
    try {
        console.log(`🚀 Starting upload and mint process for token #${tokenId}...`);
        
        // Step 1: Upload to Pinata
        console.log("\n📤 Step 1: Uploading to Pinata...");
        const uploadResult = await uploadNFT(imagePath, tokenId, attributes);
        
        // Step 2: Mint on blockchain
        console.log("\n🏗️ Step 2: Minting on blockchain...");
        
        // Get contract instance
        const GameNFT = await ethers.getContractFactory("GameNFT");
        const gameNFT = GameNFT.attach(contractAddress);
        
        // Mint the NFT
        const mintTx = await gameNFT.mint(recipientAddress, uploadResult.metadataUrl);
        await mintTx.wait();
        
        console.log(`✅ NFT #${tokenId} minted successfully!`);
        console.log(`🔗 Transaction Hash: ${mintTx.hash}`);
        console.log(`🌐 Amoy Explorer: https://www.oklink.com/amoy/tx/${mintTx.hash}`);
        
        return {
            tokenId,
            uploadResult,
            mintTx: mintTx.hash,
            metadataUrl: uploadResult.metadataUrl
        };
        
    } catch (error) {
        console.error(`❌ Error in upload and mint process: ${error.message}`);
        throw error;
    }
}

async function batchUploadAndMint(imagePaths, recipientAddress, contractAddress, startTokenId = 1) {
    const results = [];
    
    console.log(`🚀 Starting batch upload and mint of ${imagePaths.length} NFTs...`);
    
    for (let i = 0; i < imagePaths.length; i++) {
        const tokenId = startTokenId + i;
        const imagePath = imagePaths[i];
        
        console.log(`\n--- NFT #${tokenId} ---`);
        
        try {
            const result = await uploadAndMint(imagePath, tokenId, recipientAddress, contractAddress);
            results.push(result);
            
            // Add delay between operations to avoid rate limiting
            if (i < imagePaths.length - 1) {
                console.log(`⏳ Waiting 3 seconds before next NFT...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } catch (error) {
            console.error(`❌ Failed to process NFT #${tokenId}: ${error.message}`);
            results.push({ tokenId, error: error.message });
        }
    }
    
    console.log(`\n📊 Batch process completed!`);
    console.log(`✅ Successful: ${results.filter(r => !r.error).length}`);
    console.log(`❌ Failed: ${results.filter(r => r.error).length}`);
    
    return results;
}

async function main() {
    // Configuration - UPDATE THESE VALUES
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ;
    const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS ;
    
    // Check configuration
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.length !== 42) {
        console.error("❌ Contract address not configured");
        console.log("💡 Please set CONTRACT_ADDRESS in your .env file or update the script");
        process.exit(1);
    }
    
    if (!RECIPIENT_ADDRESS || RECIPIENT_ADDRESS.length !== 42) {
        console.error("❌ Recipient address not configured");
        console.log("💡 Please set RECIPIENT_ADDRESS in your .env file or update the script");
        process.exit(1);
    }
    
    // Check if addresses are valid
    if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        console.error("❌ Invalid contract address");
        process.exit(1);
    }
    
    if (!ethers.isAddress(RECIPIENT_ADDRESS)) {
        console.error("❌ Invalid recipient address");
        process.exit(1);
    }
    
    console.log("📋 Configuration:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Recipient: ${RECIPIENT_ADDRESS}`);
    
    // Example usage with single image
    const imagePath = path.join(__dirname, '..', 'assets', 'nfttest.png');
    
    // Check if image exists
    const fs = require('fs');
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Image not found: ${imagePath}`);
        console.log("💡 Please place your image file at: assets/nfttest.png");
        process.exit(1);
    }
    
    // Upload and mint single NFT
    console.log("\n🎯 Processing single NFT...");
    await uploadAndMint(imagePath, 1, RECIPIENT_ADDRESS, CONTRACT_ADDRESS);
    
    // Example batch processing (uncomment to use)
    // const imagePaths = [
    //     path.join(__dirname, '..', 'assets', 'nfttest.png'),
    //     path.join(__dirname, '..', 'assets', 'nfttest2.png'),
    //     path.join(__dirname, '..', 'assets', 'nfttest3.png')
    // ];
    // await batchUploadAndMint(imagePaths, RECIPIENT_ADDRESS, CONTRACT_ADDRESS, 1);
    
    console.log("\n🎉 Upload and mint process completed!");
    console.log(`🔗 View your NFTs on Amoy Explorer: https://www.oklink.com/amoy/address/${RECIPIENT_ADDRESS}`);
}

if (require.main === module) {
    main()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Process failed:", error);
            process.exit(1);
        });
}

module.exports = {
    uploadAndMint,
    batchUploadAndMint
}; 