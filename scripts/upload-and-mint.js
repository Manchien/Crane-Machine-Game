const { ethers } = require("hardhat");
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// IPFS Gateway URLs - you can use public gateways or your own
const IPFS_GATEWAYS = {
    pinata: 'https://gateway.pinata.cloud/ipfs/',
    ipfs: 'https://ipfs.io/ipfs/',
    cloudflare: 'https://cloudflare-ipfs.com/ipfs/'
};

// Function to upload to Pinata (recommended for production)
async function uploadToPinata(content, isJSON = false) {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
    
    if (!pinataApiKey || !pinataSecretApiKey) {
        throw new Error("Pinata API keys not found in .env file");
    }
    
    const url = isJSON 
        ? 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
        : 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    
    let data;
    let headers = {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
    };
    
    if (isJSON) {
        data = content;
        headers['Content-Type'] = 'application/json';
    } else {
        data = new FormData();
        data.append('file', content);
        headers = { ...headers, ...data.getHeaders() };
    }
    
    try {
        const response = await axios.post(url, data, { headers });
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading to Pinata:', error.response?.data || error.message);
        throw error;
    }
}

// Function to upload image from local file
async function uploadImageToIPFS(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const imageStream = fs.createReadStream(imagePath);
        const ipfsHash = await uploadToPinata(imageStream, false);
        return `${IPFS_GATEWAYS.pinata}${ipfsHash}`;
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw error;
    }
}

// Function to generate metadata for an NFT
function generateMetadata(tokenId, imageUrl, customAttributes = {},imagePathOrUrl) {
    const filename = imagePathOrUrl.split('\\').pop(); // "123.png"
    console.log("filename:", filename);
    const number = filename.replace('.png', ''); // "123"
    // console.log("number:", number);
    // const id = parseInt(number, 10); // 123（number ）

    console.log("number:", number);

    const metadata = {
        name: `${number}Game NFT #${tokenId}`,
        description: `Crane Machine Game NFT Collection - Token #${tokenId}`,
        image: imageUrl,
        attributes: [
            {
                trait_type: "Token ID",
                value: tokenId
            },
            ...Object.entries(customAttributes).map(([key, value]) => ({
                trait_type: key,
                value: value
            }))
        ]
    };

    return metadata;
}

// Function to upload metadata to IPFS
async function uploadMetadataToIPFS(metadata) {
    try {
        const ipfsHash = await uploadToPinata(metadata, true);
        return `${IPFS_GATEWAYS.pinata}${ipfsHash}`;
    } catch (error) {
        console.error('Error uploading metadata to IPFS:', error);
        throw error;
    }
}

// Main minting function
async function mintNFT(recipientAddress, contractAddress, imagePathOrUrl, customAttributes = {}, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`🚀 Starting mint process... (Attempt ${retryCount + 1}/${maxRetries})`);
            
            let imageUrl;
            // Check if it's a local file path or URL
            if (imagePathOrUrl.startsWith('http')) {
                imageUrl = imagePathOrUrl;
                console.log(`📸 Using image URL: ${imageUrl}`);
            } else {
                console.log(`📸 Uploading local image to IPFS: ${imagePathOrUrl}`);
                imageUrl = await uploadImageToIPFS(imagePathOrUrl);
                console.log(`✅ Image uploaded to IPFS: ${imageUrl}`);
            }
            
            // Get contract instance
            const GameNFT = await ethers.getContractFactory("GameNFT");
            const gameNFT = GameNFT.attach(contractAddress);
            
            // Get current token ID (assumes sequential minting)
            const currentSupply = await gameNFT.totalSupply();
            const tokenId = Number(currentSupply) + 1;
            
            // Generate metadata
            const metadata = generateMetadata(tokenId, imageUrl, customAttributes,imagePathOrUrl);
            // console.log(`📋 Generated metadata:`, JSON.stringify(metadata, null, 2));
            
            // Upload metadata to IPFS
            let metadataURI;
            if (process.env.USE_IPFS === 'true') {
                console.log(`📤 Uploading metadata to IPFS...`);
                metadataURI = await uploadMetadataToIPFS(metadata);
                console.log(`✅ Metadata uploaded to IPFS: ${metadataURI}`);
            } else {
                // For testing: use data URI
                const jsonString = JSON.stringify(metadata);
                const base64 = Buffer.from(jsonString).toString('base64');
                metadataURI = `data:application/json;base64,${base64}`;
                console.log(`⚠️  Using data URI for metadata (not recommended for production)`);
            }
            
            // Mint the NFT
            console.log(`🏗️ Minting NFT #${tokenId} to ${recipientAddress}...`);
            const mintTx = await gameNFT.mint(recipientAddress, metadataURI);
            const receipt = await mintTx.wait();
            
            console.log(`✅ NFT #${tokenId} minted successfully!`);
            console.log(`🔗 Transaction Hash: ${mintTx.hash}`);
            console.log(`🌐 Amoy Explorer: https://www.oklink.com/amoy/tx/${mintTx.hash}`);
            console.log(`🖼️ Image URL: ${imageUrl}`);
            console.log(`📋 Metadata URI: ${metadataURI}`);
            
            return {
                tokenId,
                transactionHash: mintTx.hash,
                metadata,
                metadataURI,
                imageUrl,
                receipt
            };
            
        } catch (error) {
            retryCount++;
            console.error(`❌ Error in mint process (Attempt ${retryCount}/${maxRetries}): ${error.message}`);
            
            // Handle specific error types
            if (error.message.includes("already known")) {
                console.error("⚠️  交易重複，已經在 mempool 中，請稍後再試");
                if (retryCount < maxRetries) {
                    console.log(`⏳ 等待 5 秒後重試...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
            } else if (error.message.includes("nonce too low")) {
                console.error("⚠️  Nonce 太低，可能是重複交易");
                if (retryCount < maxRetries) {
                    console.log(`⏳ 等待 3 秒後重試...`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    continue;
                }
            } else if (error.message.includes("insufficient funds")) {
                console.error("❌ 餘額不足，無法支付 gas 費用");
                throw error; // Don't retry for insufficient funds
            } else if (error.message.includes("network") || error.message.includes("timeout")) {
                console.error("⚠️  網路連線問題，重試中...");
                if (retryCount < maxRetries) {
                    console.log(`⏳ 等待 10 秒後重試...`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    continue;
                }
            } else {
                // For other errors, don't retry
                console.error("❌ 未知錯誤，停止重試");
                throw error;
            }
            
            // If we've exhausted all retries
            if (retryCount >= maxRetries) {
                console.error(`❌ 已重試 ${maxRetries} 次，仍然失敗`);
                throw error;
            }
        }
    }
}

// Batch minting function
async function batchMintNFTs(recipientAddress, contractAddress, imagePathsOrUrls) {
    const results = [];
    
    console.log(`🚀 Starting batch mint of ${imagePathsOrUrls.length} NFTs...`);
    
    for (let i = 0; i < imagePathsOrUrls.length; i++) {
        const imagePathOrUrl = imagePathsOrUrls[i];
        
        console.log(`\n--- Minting NFT ${i + 1}/${imagePathsOrUrls.length} ---`);
        
        try {
            const result = await mintNFT(recipientAddress, contractAddress, imagePathOrUrl);
            results.push(result);
            
            // Add delay between operations to avoid issues
            if (i < imagePathsOrUrls.length - 1) {
                console.log(`⏳ Waiting 2 seconds before next mint...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`❌ Failed to mint NFT with image ${imagePathOrUrl}: ${error.message}`);
            results.push({ imagePathOrUrl, error: error.message });
        }
    }
    
    console.log(`\n📊 Batch mint completed!`);
    console.log(`✅ Successful: ${results.filter(r => !r.error).length}`);
    console.log(`❌ Failed: ${results.filter(r => r.error).length}`);
    
    return results;
}

// Helper function to display available local images
function displayAvailableLocalImages() {
    console.log("\n📸 Available Local Images:");
    
    // Read dolls_inventory.json to get the latest filename
    const inventoryPath = path.join(__dirname, 'dolls_inventory.json');
    let latestFilename = '01'; // default fallback
    
    if (fs.existsSync(inventoryPath)) {
        try {
            const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
            if (inventoryData.length > 0) {
                // Find the latest entry based on time field
                const latestEntry = inventoryData.reduce((latest, current) => {
                    return (current.time > latest.time) ? current : latest;
                });
                latestFilename = latestEntry.img.replace('.png', ''); // Remove .png extension
                console.log(`📋 Using latest filename from inventory: ${latestEntry.img}`);
            }
        } catch (error) {
            console.error('Error reading dolls_inventory.json:', error);
        }
    }
    
    // Use the sprites root directory since the inventory images are there
    const assetsDir = path.join(__dirname, '..', 'WebContent', 'assets', 'sprites',"01");
    
    // Load inventory and map to actual file paths
    const inventory = require('./dolls_inventory.json');
    
    inventory.forEach(item => {
        console.log('🎁 圖片檔名:', item.img);
    });
    
    // Map inventory items to their actual file paths
    return inventory.map(item => path.join(assetsDir, item.img));
}

async function main() {
    // Configuration
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    let RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS; // Use let to allow modification

    // --- New logic to read recipient address from file ---
    const userInputPath = path.join(__dirname, '..', 'assets', 'userInput.txt');
    try {
        if (fs.existsSync(userInputPath)) {
            const fileContent = fs.readFileSync(userInputPath, 'utf8').trim();
            if (fileContent && ethers.isAddress(fileContent)) {
                console.log(`📝 Found valid address in userInput.txt, overriding .env file.`);
                RECIPIENT_ADDRESS = fileContent;
            } else if (fileContent) {
                console.warn(`⚠️ Address in userInput.txt is invalid: "${fileContent}". Falling back to .env file.`);
            }
        }
    } catch (error) {
        console.error(`🚨 Error reading userInput.txt: ${error.message}. Falling back to .env file.`);
    }
    // --- End of new logic ---
    
    // Validate configuration
    if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) {
        console.error("❌ Invalid or missing CONTRACT_ADDRESS in .env file");
        process.exit(1);
    }
    
    if (!RECIPIENT_ADDRESS || !ethers.isAddress(RECIPIENT_ADDRESS)) {
        console.error("❌ Invalid or missing RECIPIENT_ADDRESS in .env file or userInput.txt");
        process.exit(1);
    }
    
    console.log("📋 Configuration:");
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Recipient: ${RECIPIENT_ADDRESS}`);
    console.log(`   USE_IPFS: ${process.env.USE_IPFS || 'false'}`);
    
    if (process.env.USE_IPFS === 'true' && (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY)) {
        console.error("❌ IPFS is enabled but Pinata API keys are missing in .env file");
        console.log("💡 Get your Pinata API keys from https://pinata.cloud");
        console.log("   Or set USE_IPFS=false to use data URIs instead");
        process.exit(1);
    }
    
    // Display available local images
    const localImages = displayAvailableLocalImages();
    
    console.log(`📊 Found ${localImages.length} images in inventory`);
    console.log(`📋 Image paths:`, localImages);
    
    // Example: Mint with a local image
    if (localImages.length > 0) {
        console.log("\n🎯 Example 1: Minting NFT with local image...");
        // Use the latest image (last in the array) instead of hardcoded index 2
        const latestImagePath = localImages[localImages.length - 1];
        console.log(`🎯 Using image: ${latestImagePath}`);
        
        await mintNFT(RECIPIENT_ADDRESS, CONTRACT_ADDRESS, latestImagePath, {
            "Rarity": "Common",
            "Power": 10
        });
    } else {
        console.log("\n⚠️  No local images found in assets directory");
        console.log("💡 Add images to the 'assets' directory or use URLs");
    }
    
    // Example: Mint with a URL (using a stable image URL)
    // console.log("\n🎯 Example 2: Minting NFT with image URL...");
    // await mintNFT(RECIPIENT_ADDRESS, CONTRACT_ADDRESS, 
    //     "https://ipfs.io/ipfs/QmXmNSH51FKKQBYYbBzA8fFXq3D7Y6jRVhp8J93VrhGVFG",
    //     {
    //         "Rarity": "Rare",
    //         "Power": 25
    //     }
    // );
    
    console.log("\n🎉 Minting process completed!");
    console.log(`🔗 View your NFTs on Amoy Explorer: https://www.oklink.com/amoy/address/${RECIPIENT_ADDRESS}`);
}

main();