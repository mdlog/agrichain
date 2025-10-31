// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IHarvestTokenNFT.sol";

/**
 * @title HarvestTokenNFT
 * @notice Manages Hedera Token Service (HTS) NFT registration and tracking
 * @dev This contract tracks HTS NFTs created off-chain via Hedera SDK
 * 
 * Architecture:
 * 1. Backend creates NFT via Hedera SDK (TokenCreateTransaction)
 * 2. Backend calls this contract to register the NFT
 * 3. AgriChainFinance uses this contract to verify NFT ownership
 * 4. NFT remains on Hedera, this contract only tracks metadata
 */
contract HarvestTokenNFT is IHarvestTokenNFT, Ownable {
    
    // Internal ID counter
    uint256 private _tokenIdCounter;
    
    // Mapping: internal ID => HTS token address
    mapping(uint256 => address) public htsTokenIds;
    
    // Mapping: internal ID => serial number
    mapping(uint256 => uint256) public serialNumbers;
    
    // Mapping: internal ID => metadata
    mapping(uint256 => HarvestMetadata) public harvestNFTs;
    
    // Mapping: farmer => array of internal IDs
    mapping(address => uint256[]) private farmerNFTs;
    
    // Mapping: HTS token ID + serial => internal ID (for lookup)
    mapping(bytes32 => uint256) private nftLookup;
    
    // Authorized contracts (AgriChainFinance)
    mapping(address => bool) public authorizedContracts;
    
    constructor() Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @notice Authorize a contract to interact with NFTs
     * @param contractAddress Address to authorize
     */
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    /**
     * @notice Revoke contract authorization
     * @param contractAddress Address to revoke
     */
    function revokeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedContracts[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    /**
     * @notice Register HTS NFT created off-chain
     * @dev Called by backend after creating NFT via Hedera SDK
     */
    function registerHarvestNFT(
        address tokenId,
        uint256 serialNumber,
        HarvestMetadata memory metadata
    ) external onlyAuthorized returns (uint256) {
        require(tokenId != address(0), "Invalid token ID");
        require(metadata.farmer != address(0), "Invalid farmer");
        require(metadata.estimatedValue > 0, "Invalid value");
        require(metadata.harvestDate > block.timestamp, "Invalid harvest date");
        
        // Create lookup key
        bytes32 lookupKey = keccak256(abi.encodePacked(tokenId, serialNumber));
        require(nftLookup[lookupKey] == 0, "NFT already registered");
        
        uint256 internalId = _tokenIdCounter++;
        
        // Store HTS reference
        htsTokenIds[internalId] = tokenId;
        serialNumbers[internalId] = serialNumber;
        
        // Store metadata
        harvestNFTs[internalId] = metadata;
        
        // Track farmer's NFTs
        farmerNFTs[metadata.farmer].push(internalId);
        
        // Create lookup
        nftLookup[lookupKey] = internalId;
        
        emit HarvestNFTRegistered(internalId, tokenId, serialNumber, metadata.farmer);
        
        return internalId;
    }
    
    /**
     * @notice Get harvest NFT metadata
     */
    function getHarvestNFT(uint256 internalId) 
        external 
        view 
        returns (HarvestMetadata memory) 
    {
        require(internalId > 0 && internalId < _tokenIdCounter, "Invalid ID");
        return harvestNFTs[internalId];
    }
    
    /**
     * @notice Get HTS token details
     */
    function getHTSDetails(uint256 internalId) 
        external 
        view 
        returns (address tokenId, uint256 serialNumber) 
    {
        require(internalId > 0 && internalId < _tokenIdCounter, "Invalid ID");
        return (htsTokenIds[internalId], serialNumbers[internalId]);
    }
    
    /**
     * @notice Check if farmer owns the NFT
     */
    function isNFTOwner(uint256 internalId, address farmer) 
        external 
        view 
        returns (bool) 
    {
        require(internalId > 0 && internalId < _tokenIdCounter, "Invalid ID");
        return harvestNFTs[internalId].farmer == farmer;
    }
    
    /**
     * @notice Deactivate NFT (when used as collateral)
     */
    function deactivateNFT(uint256 internalId) external onlyAuthorized {
        require(internalId > 0 && internalId < _tokenIdCounter, "Invalid ID");
        require(harvestNFTs[internalId].isActive, "Already inactive");
        
        harvestNFTs[internalId].isActive = false;
        
        emit NFTDeactivated(internalId);
    }
    
    /**
     * @notice Reactivate NFT (when loan is repaid)
     */
    function reactivateNFT(uint256 internalId) external onlyAuthorized {
        require(internalId > 0 && internalId < _tokenIdCounter, "Invalid ID");
        require(!harvestNFTs[internalId].isActive, "Already active");
        
        harvestNFTs[internalId].isActive = true;
        
        emit NFTReactivated(internalId);
    }
    
    /**
     * @notice Get farmer's NFTs
     */
    function getFarmerNFTs(address farmer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return farmerNFTs[farmer];
    }
    
    /**
     * @notice Get total NFT count
     */
    function getTotalNFTs() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @notice Lookup internal ID by HTS token ID and serial
     */
    function lookupNFT(address tokenId, uint256 serialNumber) 
        external 
        view 
        returns (uint256) 
    {
        bytes32 lookupKey = keccak256(abi.encodePacked(tokenId, serialNumber));
        return nftLookup[lookupKey];
    }
}
