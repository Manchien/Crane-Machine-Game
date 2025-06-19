// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("GameNFT", function () {
//   let GameNFT;
//   let gameNFT;
//   let owner;
//   let addr1;
//   let addr2;

//   beforeEach(async function () {
//     // Get signers
//     [owner, addr1, addr2] = await ethers.getSigners();

//     // Deploy contract
//     GameNFT = await ethers.getContractFactory("GameNFT");
//     gameNFT = await GameNFT.deploy(
//       "Crane Game NFT",
//       "CRANE",
//       "https://your-metadata-server.com/metadata/"
//     );
//   });

//   describe("Deployment", function () {
//     it("Should set the right owner", async function () {
//       expect(await gameNFT.owner()).to.equal(owner.address);
//     });

//     it("Should set the correct name and symbol", async function () {
//       expect(await gameNFT.name()).to.equal("Crane Game NFT");
//       expect(await gameNFT.symbol()).to.equal("CRANE");
//     });

//     it("Should set the correct base URI", async function () {
//       expect(await gameNFT.baseURI()).to.equal("https://your-metadata-server.com/metadata/");
//     });
//   });

//   describe("Minting", function () {
//     it("Should allow owner to mint NFT", async function () {
//       const tokenURI = "https://your-metadata-server.com/metadata/1.json";
      
//       await expect(gameNFT.mint(addr1.address, tokenURI))
//         .to.emit(gameNFT, "NFTMinted")
//         .withArgs(addr1.address, 1, tokenURI);

//       expect(await gameNFT.ownerOf(1)).to.equal(addr1.address);
//       expect(await gameNFT.tokenURI(1)).to.equal(tokenURI);
//       expect(await gameNFT.totalSupply()).to.equal(1);
//     });

//     it("Should not allow non-owner to mint", async function () {
//       const tokenURI = "https://your-metadata-server.com/metadata/1.json";
      
//       await expect(
//         gameNFT.connect(addr1).mint(addr1.address, tokenURI)
//       ).to.be.revertedWithCustomError(gameNFT, "OwnableUnauthorizedAccount");
//     });

//     it("Should allow batch minting", async function () {
//       const tokenURIs = [
//         "https://your-metadata-server.com/metadata/1.json",
//         "https://your-metadata-server.com/metadata/2.json",
//         "https://your-metadata-server.com/metadata/3.json"
//       ];

//       await gameNFT.batchMint(addr1.address, tokenURIs);

//       expect(await gameNFT.totalSupply()).to.equal(3);
//       expect(await gameNFT.ownerOf(1)).to.equal(addr1.address);
//       expect(await gameNFT.ownerOf(2)).to.equal(addr1.address);
//       expect(await gameNFT.ownerOf(3)).to.equal(addr1.address);
//     });
//   });

//   describe("Token Information", function () {
//     beforeEach(async function () {
//       await gameNFT.mint(addr1.address, "https://your-metadata-server.com/metadata/1.json");
//     });

//     it("Should return correct token URI", async function () {
//       expect(await gameNFT.tokenURI(1)).to.equal("https://your-metadata-server.com/metadata/1.json");
//     });

//     it("Should return correct total supply", async function () {
//       expect(await gameNFT.totalSupply()).to.equal(1);
//     });

//     it("Should return correct next token ID", async function () {
//       expect(await gameNFT.nextTokenId()).to.equal(2);
//     });
//   });

//   describe("Ownership", function () {
//     it("Should allow owner to update base URI", async function () {
//       const newBaseURI = "https://new-metadata-server.com/metadata/";
//       await gameNFT.setBaseURI(newBaseURI);
//       expect(await gameNFT.baseURI()).to.equal(newBaseURI);
//     });

//     it("Should not allow non-owner to update base URI", async function () {
//       const newBaseURI = "https://new-metadata-server.com/metadata/";
//       await expect(
//         gameNFT.connect(addr1).setBaseURI(newBaseURI)
//       ).to.be.revertedWithCustomError(gameNFT, "OwnableUnauthorizedAccount");
//     });
//   });
// }); 