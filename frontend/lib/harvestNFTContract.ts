import { ethers } from 'ethers'

// HarvestTokenNFT Contract Address
const HARVEST_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HARVEST_TOKEN_NFT_CONTRACT || ''

// HarvestTokenNFT ABI - NFT Registration and Management
const HARVEST_NFT_ABI = [
    // View Functions
    'function registeredNFTs(address, uint256) view returns (uint256 internalId, address tokenAddress, uint256 serialNumber, string cropType, uint256 expectedYield, uint256 estimatedValue, uint256 harvestDate, string farmLocation, uint256 farmSize, address farmer, uint256 createdAt, bool isActive)',
    'function getNFTByInternalId(uint256 _internalId) view returns (tuple(uint256 internalId, address tokenAddress, uint256 serialNumber, string cropType, uint256 expectedYield, uint256 estimatedValue, uint256 harvestDate, string farmLocation, uint256 farmSize, address farmer, uint256 createdAt, bool isActive))',
    'function getFarmerNFTs(address _farmer) view returns (uint256[])',
    'function isNFTActive(uint256 _internalId) view returns (bool)',
    'function nftCounter() view returns (uint256)',

    // Ownable Functions
    'function owner() view returns (address)',
    'function transferOwnership(address newOwner)',

    // Write Functions
    'function registerHarvestNFT(address _tokenAddress, uint256 _serialNumber, tuple(string cropType, uint256 expectedYield, uint256 estimatedValue, uint256 harvestDate, string farmLocation, uint256 farmSize, address farmer, uint256 createdAt, bool isActive) _metadata) returns (uint256)',
    'function activateNFT(uint256 _internalId)',
    'function deactivateNFT(uint256 _internalId)',
    'function setAgriChainFinance(address _agriChainFinance)',

    // Events
    'event HarvestNFTRegistered(uint256 indexed internalId, address indexed tokenAddress, uint256 serialNumber, address indexed farmer)',
    'event NFTActivated(uint256 indexed internalId)',
    'event NFTDeactivated(uint256 indexed internalId)'
]

export function getHarvestNFTContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(HARVEST_NFT_CONTRACT_ADDRESS, HARVEST_NFT_ABI, signerOrProvider)
}

export { HARVEST_NFT_CONTRACT_ADDRESS, HARVEST_NFT_ABI }
