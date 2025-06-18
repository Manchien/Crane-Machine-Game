const PinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function uploadImageToPinata(imagePath) {
    try {
        console.log(`📤 Uploading image: ${imagePath}`);
        
        const readableStreamForFile = fs.createReadStream(imagePath);
        const options = {
            pinataMetadata: {
                name: path.basename(imagePath, path.extname(imagePath)),
                keyvalues: {
                    type: "nft-image",
                    game: "crane-game"
                }
            }
        };
        
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        console.log(`✅ Image uploaded successfully!`);
        console.log(`🔗 IPFS Hash: ${result.IpfsHash}`);
        console.log(`🌐 IPFS URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        
        return result.IpfsHash;
    } catch (error) {
        console.error(`❌ Error uploading image: ${error.message}`);
        throw error;
    }
}

async function uploadMetadataToPinata(metadata, tokenId) {
    try {
        console.log(`📤 Uploading metadata for token #${tokenId}`);
        
        const options = {
            pinataMetadata: {
                name: `Crane Game NFT #${tokenId}`,
                keyvalues: {
                    type: "nft-metadata",
                    game: "crane-game",
                    tokenId: tokenId.toString()
                }
            }
        };
        
        const result = await pinata.pinJSONToIPFS(metadata, options);
        console.log(`✅ Metadata uploaded successfully!`);
        console.log(`🔗 IPFS Hash: ${result.IpfsHash}`);
        console.log(`🌐 IPFS URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
        
        return result.IpfsHash;
    } catch (error) {
        console.error(`❌ Error uploading metadata: ${error.message}`);
        throw error;
    }
}

async function createMetadata(imageHash, tokenId, attributes = {}) {
    const metadata = {
        name: `Crane Game NFT #${tokenId}`,
        description: "A rare collectible from the legendary Crane Game. This NFT represents your skill and luck in the arcade!",
        image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        external_url: "https://your-game-website.com",
        attributes: [
            {
                trait_type: "Rarity",
                value: attributes.rarity || "Common"
            },
            {
                trait_type: "Game Score",
                value: attributes.score || Math.floor(Math.random() * 2000) + 500
            },
            {
                trait_type: "Difficulty",
                value: attributes.difficulty || "Easy"
            },
            {
                trait_type: "Collection",
                value: "Crane Game Series"
            },
            {
                trait_type: "Mint Date",
                value: new Date().toISOString().split('T')[0]
            }
        ],
        properties: {
            files: [
                {
                    uri: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
                    type: "image/png"
                }
            ],
            category: "image",
            creators: [
                {
                    address: process.env.CREATOR_ADDRESS || "YOUR_CREATOR_ADDRESS",
                    share: 100
                }
            ]
        }
    };
    
    return metadata;
}

async function uploadNFT(imagePath, tokenId, attributes = {}) {
    try {
        console.log(`🎨 Starting NFT upload process for token #${tokenId}...`);
        
        // Upload image to IPFS
        const imageHash = await uploadImageToPinata(imagePath);
        
        // Create metadata
        const metadata = await createMetadata(imageHash, tokenId, attributes);
        
        // Upload metadata to IPFS
        const metadataHash = await uploadMetadataToPinata(metadata, tokenId);
        
        console.log(`\n🎉 NFT #${tokenId} upload completed!`);
        console.log(`📋 Summary:`);
        console.log(`   Image Hash: ${imageHash}`);
        console.log(`   Metadata Hash: ${metadataHash}`);
        console.log(`   Metadata URL: https://gateway.pinata.cloud/ipfs/${metadataHash}`);
        
        return {
            tokenId,
            imageHash,
            metadataHash,
            metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
            metadata
        };
        
    } catch (error) {
        console.error(`❌ Error in NFT upload process: ${error.message}`);
        throw error;
    }
}

async function batchUploadNFTs(imagePaths, startTokenId = 1) {
    const results = [];
    
    console.log(`🚀 Starting batch upload of ${imagePaths.length} NFTs...`);
    
    for (let i = 0; i < imagePaths.length; i++) {
        const tokenId = startTokenId + i;
        const imagePath = imagePaths[i];
        
        console.log(`\n--- NFT #${tokenId} ---`);
        
        try {
            const result = await uploadNFT(imagePath, tokenId);
            results.push(result);
            
            // Add delay between uploads to avoid rate limiting
            if (i < imagePaths.length - 1) {
                console.log(`⏳ Waiting 2 seconds before next upload...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`❌ Failed to upload NFT #${tokenId}: ${error.message}`);
            results.push({ tokenId, error: error.message });
        }
    }
    
    console.log(`\n📊 Batch upload completed!`);
    console.log(`✅ Successful: ${results.filter(r => !r.error).length}`);
    console.log(`❌ Failed: ${results.filter(r => r.error).length}`);
    
    return results;
}

// Main execution
async function main() {
    // Check if Pinata credentials are set
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
        console.error("❌ Pinata API credentials not found in .env file");
        console.log("💡 Please add your Pinata API credentials to .env file:");
        console.log("   PINATA_API_KEY=your_api_key");
        console.log("   PINATA_SECRET_API_KEY=your_secret_key");
        process.exit(1);
    }
    
    // Test Pinata connection
    try {
        console.log("🔗 Testing Pinata connection...");
        const testResult = await pinata.testAuthentication();
        console.log("✅ Pinata connection successful!");
    } catch (error) {
        console.error("❌ Pinata authentication failed:", error.message);
        process.exit(1);
    }
    
    // Example usage
    const imagePath = path.join(__dirname, '..', 'assets', 'nfttest.png');
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Image not found: ${imagePath}`);
        console.log("💡 Please place your image file at: assets/nfttest.png");
        process.exit(1);
    }
    
    // Upload single NFT
    console.log("🎯 Uploading single NFT...");
    await uploadNFT(imagePath, 1);
    
    // Example batch upload (uncomment to use)
    // const imagePaths = [
    //     path.join(__dirname, '..', 'assets', 'nfttest.png'),
    //     path.join(__dirname, '..', 'assets', 'nfttest2.png'),
    //     path.join(__dirname, '..', 'assets', 'nfttest3.png')
    // ];
    // await batchUploadNFTs(imagePaths, 1);
}

if (require.main === module) {
    main()
        .then(() => {
            console.log("\n🎉 Upload process completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Upload process failed:", error);
            process.exit(1);
        });
}

module.exports = {
    uploadImageToPinata,
    uploadMetadataToPinata,
    createMetadata,
    uploadNFT,
    batchUploadNFTs
}; 