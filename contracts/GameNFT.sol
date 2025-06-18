// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GameNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    // Base URI for metadata
    string private _baseTokenURI;
    // Mapping for token metadata
    mapping(uint256 => string) private _tokenURIs;
    
    // NFT Marketplace functionality
    mapping(uint256 => uint256) private _tokenPrices; // tokenId => price in wei
    mapping(uint256 => bool) private _tokenForSale; // tokenId => is for sale
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event NFTListedForSale(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTPriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event NFTRemovedFromSale(uint256 indexed tokenId, address indexed owner);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }
    
    /**
     * @dev Mint a new NFT
     * @param to Address to mint the NFT to
     * @param tokenURI_ URI for the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory tokenURI_) 
        public 
        onlyOwner 
        returns (uint256) 
    {
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);
        
        emit NFTMinted(to, newTokenId, tokenURI_);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs
     * @param to Address to mint the NFTs to
     * @param tokenURIs_ Array of URIs for the token metadata
     * @return tokenIds Array of the newly minted token IDs
     */
    function batchMint(address to, string[] memory tokenURIs_) 
        public 
        onlyOwner 
        returns (uint256[] memory) 
    {
        uint256[] memory tokenIds = new uint256[](tokenURIs_.length);
        
        for (uint256 i = 0; i < tokenURIs_.length; i++) {
            tokenIds[i] = mint(to, tokenURIs_[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev List NFT for sale
     * @param tokenId The token ID to list
     * @param price Price in wei
     */
    function listForSale(uint256 tokenId, uint256 price) public {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(price > 0, "Price must be greater than 0");
        require(getApproved(tokenId) == address(this) || isApprovedForAll(msg.sender, address(this)), 
                "Contract not approved to transfer NFT");
        
        _tokenPrices[tokenId] = price;
        _tokenForSale[tokenId] = true;
        
        emit NFTListedForSale(tokenId, price, msg.sender);
    }
    
    /**
     * @dev Buy NFT
     * @param tokenId The token ID to buy
     */
    function buyNFT(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(_tokenForSale[tokenId], "NFT is not for sale");
        require(msg.value >= _tokenPrices[tokenId], "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own NFT");
        
        address seller = ownerOf(tokenId);
        uint256 price = _tokenPrices[tokenId];
        
        // Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer payment to seller
        payable(seller).transfer(price);
        
        // Return excess payment to buyer
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Remove from sale
        _tokenForSale[tokenId] = false;
        _tokenPrices[tokenId] = 0;
        
        emit NFTSold(tokenId, seller, msg.sender, price);
    }
    
    /**
     * @dev Update NFT price
     * @param tokenId The token ID
     * @param newPrice New price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(_tokenForSale[tokenId], "NFT is not for sale");
        require(newPrice > 0, "Price must be greater than 0");
        
        _tokenPrices[tokenId] = newPrice;
        
        emit NFTPriceUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Remove NFT from sale
     * @param tokenId The token ID
     */
    function removeFromSale(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this NFT");
        require(_tokenForSale[tokenId], "NFT is not for sale");
        
        _tokenForSale[tokenId] = false;
        _tokenPrices[tokenId] = 0;
        
        emit NFTRemovedFromSale(tokenId, msg.sender);
    }
    
    /**
     * @dev Get NFT price
     * @param tokenId The token ID
     * @return price Price in wei
     */
    function getNFTPrice(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        return _tokenPrices[tokenId];
    }
    
    /**
     * @dev Check if NFT is for sale
     * @param tokenId The token ID
     * @return isForSale True if NFT is for sale
     */
    function isNFTForSale(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "NFT does not exist");
        return _tokenForSale[tokenId];
    }
    
    /**
     * @dev Get all NFTs for sale
     * @return tokenIds Array of token IDs for sale
     * @return prices Array of corresponding prices
     */
    function getAllNFTsForSale() public view returns (uint256[] memory, uint256[] memory) {
        uint256 count = 0;
        
        // Count NFTs for sale
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_tokenForSale[i]) {
                count++;
            }
        }
        
        uint256[] memory tokenIds = new uint256[](count);
        uint256[] memory prices = new uint256[](count);
        uint256 index = 0;
        
        // Get NFTs for sale
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_tokenForSale[i]) {
                tokenIds[index] = i;
                prices[index] = _tokenPrices[i];
                index++;
            }
        }
        
        return (tokenIds, prices);
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get the total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Get the next token ID that will be minted
     */
    function nextTokenId() public view returns (uint256) {
        return _tokenIds + 1;
    }
    
    /**
     * @dev Update the base URI for all tokens
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    /**
     * @dev Get the base URI
     */
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Required for contract to receive ETH
    receive() external payable {}
} 