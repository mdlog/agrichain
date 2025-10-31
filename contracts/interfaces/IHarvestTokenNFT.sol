// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IHarvestTokenNFT
 * @notice Interface for Hedera Token Service (HTS) Harvest NFT integration
 * @dev This interface allows AgriChainFinance to interact with HTS tokens
 */
interface IHarvestTokenNFT {
    
    struct HarvestMetadata {
        string cropType;
        uint256 expectedYield;      // in kg
        uint256 estimatedValue;     // in HBAR wei (18 decimals)
        uint256 harvestDate;        // timestamp
        string farmLocation;
        uint256 farmSize;           // in hectares
        address farmer;
        uint256 createdAt;
        bool isActive;
    }
    
    /**
     * @notice Register HTS token created off-chain
     * @param tokenId Hedera token ID (as address)
     * @param serialNumber NFT serial number
     * @param metadata Harvest metadata
     * @return Internal token ID for tracking
     */
    function registerHarvestNFT(
        address tokenId,
        uint256 serialNumber,
        HarvestMetadata memory metadata
    ) external returns (uint256);
    
    /**
     * @notice Get harvest NFT metadata
     * @param internalId Internal tracking ID
     */
    function getHarvestNFT(uint256 internalId) 
        external 
        view 
        returns (HarvestMetadata memory);
    
    /**
     * @notice Check if farmer owns the NFT
     * @param internalId Internal tracking ID
     * @param farmer Farmer address
     */
    function isNFTOwner(uint256 internalId, address farmer) 
        external 
        view 
        returns (bool);
    
    /**
     * @notice Deactivate NFT (when used as collateral)
     * @param internalId Internal tracking ID
     */
    function deactivateNFT(uint256 internalId) external;
    
    /**
     * @notice Reactivate NFT (when loan is repaid)
     * @param internalId Internal tracking ID
     */
    function reactivateNFT(uint256 internalId) external;
    
    /**
     * @notice Get farmer's NFTs
     * @param farmer Farmer address
     */
    function getFarmerNFTs(address farmer) 
        external 
        view 
        returns (uint256[] memory);
    
    // Events
    event HarvestNFTRegistered(
        uint256 indexed internalId,
        address indexed tokenId,
        uint256 serialNumber,
        address indexed farmer
    );
    
    event NFTDeactivated(uint256 indexed internalId);
    event NFTReactivated(uint256 indexed internalId);
}
