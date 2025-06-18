# 🎮 Crane Game NFT - Polygon Amoy

This project allows you to deploy and mint NFTs for your crane game on the Polygon Amoy testnet with automated Pinata IPFS uploads.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** wallet with Polygon Amoy testnet configured
3. **Test MATIC** tokens for gas fees
4. **Pinata Account** for IPFS uploads

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```
   PRIVATE_KEY=your_private_key_here
   AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
   CONTRACT_ADDRESS=your_deployed_contract_address
   RECIPIENT_ADDRESS=your_recipient_address
   ```

3. **Get Pinata API Keys:**
   - Visit [Pinata](https://app.pinata.cloud/)
   - Create an account and get your API keys
   - Add them to your `.env` file

4. **Get test MATIC:**
   - Visit [Polygon Faucet](https://faucet.polygon.technology/)
   - Select "Amoy" testnet
   - Enter your wallet address
   - Receive test MATIC tokens

5. **Prepare your images:**
   - Place your NFT images in the `assets/` folder
   - Default image name: `nfttest.png`

### 🏗️ Deploy Contract

1. **Compile the contract:**
   ```bash
   npm run compile
   ```

2. **Deploy to Amoy testnet:**
   ```bash
   npm run deploy
   ```

3. **Save the contract address** from the deployment output
4. **Update your `.env` file** with the contract address

### 🎨 Automated NFT Upload & Mint

#### Option 1: Upload to Pinata Only
```bash
npm run upload
```
This will upload your image and metadata to Pinata IPFS.

#### Option 2: Upload and Mint Automatically
```bash
npm run upload-and-mint
```
This will:
1. Upload your image to Pinata IPFS
2. Create metadata with IPFS links
3. Upload metadata to Pinata IPFS
4. Mint the NFT on Polygon Amoy testnet

### 📁 Project Structure

```
├── contracts/
│   └── GameNFT.sol          # NFT smart contract
├── scripts/
│   ├── deploy.js            # Contract deployment script
│   ├── mint.js              # Manual NFT minting script
│   ├── upload-to-pinata.js  # Pinata upload automation
│   └── upload-and-mint.js   # Combined upload & mint
├── assets/
│   └── nfttest.png          # Your NFT images
├── metadata/
│   └── 1.json               # Sample metadata
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔧 Configuration

### Polygon Amoy Testnet

- **Network Name:** Polygon Amoy Testnet
- **RPC URL:** https://rpc-amoy.polygon.technology
- **Chain ID:** 80002
- **Currency Symbol:** MATIC
- **Block Explorer:** https://www.oklink.com/amoy

### Pinata Setup

1. **Get API Keys:**
   - Go to [Pinata Dashboard](https://app.pinata.cloud/)
   - Navigate to API Keys
   - Create a new API key
   - Copy the API Key and Secret Key

2. **Add to .env:**
   ```
   PINATA_API_KEY=your_api_key_here
   PINATA_SECRET_API_KEY=your_secret_key_here
   ```

### MetaMask Setup

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Add the following details:
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://www.oklink.com/amoy

## 🎯 Smart Contract Features

- **ERC-721 Standard:** Full NFT compatibility
- **Metadata Support:** IPFS and HTTP URI support
- **Batch Minting:** Mint multiple NFTs at once
- **Owner Controls:** Only owner can mint new NFTs
- **Token URI Storage:** Flexible metadata management

## 🤖 Automation Features

### Pinata Integration
- **Automatic Image Upload:** Upload PNG/JPG files to IPFS
- **Metadata Generation:** Create JSON metadata with attributes
- **Batch Processing:** Upload multiple NFTs at once
- **Rate Limiting:** Built-in delays to avoid API limits

### Workflow Automation
1. **Single NFT:** Upload image → Generate metadata → Mint on blockchain
2. **Batch NFTs:** Process multiple images automatically
3. **Error Handling:** Robust error handling and retry logic

## 📝 Metadata Format

Your metadata is automatically generated with this structure:

```json
{
  "name": "Crane Game NFT #1",
  "description": "A rare collectible from the legendary Crane Game...",
  "image": "https://gateway.pinata.cloud/ipfs/QmYourImageHash",
  "external_url": "https://your-game-website.com",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Common"
    },
    {
      "trait_type": "Game Score",
      "value": "1500"
    }
  ]
}
```

## 🚀 Usage Examples

### Upload Single NFT
```bash
# Place your image in assets/nfttest.png
npm run upload-and-mint
```

### Upload Multiple NFTs
Edit `scripts/upload-and-mint.js` and uncomment the batch section:
```javascript
const imagePaths = [
    path.join(__dirname, '..', 'assets', 'nfttest.png'),
    path.join(__dirname, '..', 'assets', 'nfttest2.png'),
    path.join(__dirname, '..', 'assets', 'nfttest3.png')
];
await batchUploadAndMint(imagePaths, RECIPIENT_ADDRESS, CONTRACT_ADDRESS, 1);
```

### Custom Attributes
You can pass custom attributes when uploading:
```javascript
const attributes = {
    rarity: "Rare",
    score: "2000",
    difficulty: "Hard"
};
await uploadAndMint(imagePath, 1, recipientAddress, contractAddress, attributes);
```

## 🔗 Useful Links

- [Polygon Amoy Documentation](https://wiki.polygon.technology/docs/zkEVM/develop/amoy/)
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Amoy Explorer](https://www.oklink.com/amoy)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🛠️ Troubleshooting

### Common Issues

1. **Pinata Authentication Failed:**
   - Check your API keys in `.env`
   - Verify your Pinata account is active

2. **Image Not Found:**
   - Ensure your image is in `assets/nfttest.png`
   - Check file permissions

3. **Insufficient Gas:**
   - Make sure you have enough test MATIC
   - Get more from the faucet

4. **Contract Not Deployed:**
   - Run `npm run deploy` first
   - Update `CONTRACT_ADDRESS` in `.env`

### Getting Help

- Check the [Polygon Discord](https://discord.gg/polygon)
- Review [Pinata documentation](https://docs.pinata.cloud/)
- Check transaction status on [Amoy Explorer](https://www.oklink.com/amoy)

## 📄 License

MIT License - see LICENSE file for details.

## 夹娃娃小游戏

### 使用框架：Phaser

### 地图工具：Tiled

前些天看到新闻说微信上出了个夹娃娃的游戏涉嫌传销被封禁，突然想试着学习下H5游戏开发，于是就有了这个。（请原谅我的审美观）

该项目中使用的是Phaser的P2物理引擎

### 演示：[点击此处](https://hexpang.github.io/Crane-Machine-Game/WebContent)

### 截图

![截图1](Design/screenshot01.png)

