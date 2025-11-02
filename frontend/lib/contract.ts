import { ethers } from 'ethers'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

// Full ABI dari smart contract
const CONTRACT_ABI = [
    // View Functions
    'function harvestTokens(uint256) view returns (address tokenAddress, string cropType, uint256 expectedYield, uint256 estimatedValue, uint256 harvestDate, address farmer, bool isActive)',
    'function loanRequests(uint256) view returns (uint256 id, address farmer, uint256 harvestTokenId, uint256 requestedAmount, uint256 interestRate, uint256 duration, uint256 collateralValue, uint8 status, uint256 fundedAmount, uint256 createdAt)',
    'function getLoanDetails(uint256 _loanId) view returns (tuple(uint256 id, address farmer, uint256 harvestTokenId, uint256 requestedAmount, uint256 interestRate, uint256 duration, uint256 collateralValue, uint8 status, uint256 fundedAmount, uint256 createdAt))',
    'function getFarmerLoans(address _farmer) view returns (uint256[])',
    'function getInvestorInvestments(address _investor) view returns (uint256[])',
    'function getLoanInvestments(uint256 _loanId) view returns (tuple(address investor, uint256 loanId, uint256 amount, uint256 investedAt, bool withdrawn)[])',
    'function getVerificationLevel(address farmer) view returns (uint8)',
    'function getMaxLoanAmount(address farmer) view returns (uint256)',
    'function farmerVerifications(address) view returns (uint8 level, bytes32 documentHash, uint256 verifiedAt, address verifier, bool isActive)',
    'function levelMaxLoan(uint8) view returns (uint256)',
    'function totalValueLocked() view returns (uint256)',

    // Ownable Functions
    'function owner() view returns (address)',
    'function transferOwnership(address newOwner)',
    'function renounceOwnership()',

    // Write Functions
    'function createHarvestToken(address _tokenAddress, string memory _cropType, uint256 _expectedYield, uint256 _estimatedValue, uint256 _harvestDate) returns (uint256)',
    'function createHarvestTokenFromNFT(uint256 _htsInternalId) returns (uint256)',
    'function requestLoan(uint256 _harvestTokenId, uint256 _requestedAmount, uint256 _interestRate, uint256 _duration) returns (uint256)',
    'function investInLoan(uint256 _loanId) payable',
    'function repayLoan(uint256 _loanId) payable',
    'function withdrawInvestment(uint256 _loanId, uint256 _investmentIndex)',
    'function setVerification(address farmer, uint8 level, bytes32 documentHash)',

    // Events
    'event HarvestTokenCreated(uint256 indexed tokenId, address indexed farmer, string cropType)',
    'event LoanRequested(uint256 indexed loanId, address indexed farmer, uint256 amount)',
    'event LoanFunded(uint256 indexed loanId, address indexed investor, uint256 amount)',
    'event LoanRepaid(uint256 indexed loanId, uint256 amount)',
    'event InvestmentWithdrawn(uint256 indexed loanId, address indexed investor, uint256 amount)'
]

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}

export { CONTRACT_ADDRESS, CONTRACT_ABI }
