// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IHarvestTokenNFT.sol";

/**
 * @title AgriChainFinance
 * @notice Hedera EVM Compatible - Handles tinybar to wei conversion
 * @dev CRITICAL: Hedera EVM quirk - msg.value is in TINYBAR (10^8), not wei (10^18)!
 * 
 * Hedera EVM Behavior:
 * - msg.value is received in TINYBAR (10^8 units per HBAR)
 * - We need to convert to wei (10^18) for internal storage
 * - Conversion: tinybar * 10^10 = wei
 * 
 * Example: 10 HBAR
 * - Sent from frontend: 10000000000000000000 wei (ethers.parseEther)
 * - Received by contract: 1000000000 tinybar (Hedera converts it!)
 * - We convert back: 1000000000 * 10^10 = 10000000000000000000 wei
 * 
 * HTS Integration:
 * - Supports both legacy harvest tokens and HTS NFTs
 * - HTS NFTs are created off-chain via Hedera SDK
 * - This contract tracks NFT references via HarvestTokenNFT contract
 */
contract AgriChainFinance is Ownable, ReentrancyGuard {
    
    // Hedera EVM conversion constant
    uint256 private constant TINYBAR_TO_WEI = 10**10;
    
    // HTS NFT contract reference
    IHarvestTokenNFT public harvestNFTContract;
    
    struct HarvestToken {
        address tokenAddress;
        string cropType;
        uint256 expectedYield; // in kg
        uint256 estimatedValue; // in HBAR wei (18 decimals)
        uint256 harvestDate;
        address farmer;
        bool isActive;
        bool isHTSNFT; // NEW: Flag to indicate if this is an HTS NFT
        uint256 htsInternalId; // NEW: Reference to HTS NFT internal ID
    }
    
    struct LoanRequest {
        uint256 id;
        address farmer;
        uint256 harvestTokenId;
        uint256 requestedAmount; // in HBAR wei (18 decimals)
        uint256 interestRate; // basis points (e.g., 500 = 5%)
        uint256 duration; // in days
        uint256 collateralValue; // in HBAR wei (18 decimals)
        LoanStatus status;
        uint256 fundedAmount; // in HBAR wei (18 decimals)
        uint256 createdAt;
    }
    
    struct Investment {
        address investor;
        uint256 loanId;
        uint256 amount; // in HBAR wei (18 decimals)
        uint256 investedAt;
        bool withdrawn;
    }
    
    struct FarmerVerification {
        uint8 level; // 1: Basic, 2: Verified, 3: Premium, 4: Elite
        bytes32 documentHash;
        uint256 verifiedAt;
        address verifier;
        bool isActive;
    }
    
    enum LoanStatus { Pending, Funded, Repaid, Defaulted }
    
    // Verification level limits (in HBAR wei)
    mapping(uint8 => uint256) public levelMaxLoan;
    mapping(address => FarmerVerification) public farmerVerifications;
    
    mapping(uint256 => HarvestToken) public harvestTokens;
    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(uint256 => Investment[]) public loanInvestments;
    mapping(address => uint256[]) public farmerLoans;
    mapping(address => uint256[]) public investorInvestments;
    
    uint256 public harvestTokenCounter;
    uint256 public loanRequestCounter;
    uint256 public totalValueLocked;
    
    event HarvestTokenCreated(uint256 indexed tokenId, address indexed farmer, string cropType);
    event LoanRequested(uint256 indexed loanId, address indexed farmer, uint256 amount);
    event LoanFunded(uint256 indexed loanId, address indexed investor, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 amount);
    event InvestmentWithdrawn(uint256 indexed loanId, address indexed investor, uint256 amount);
    
    constructor(address _harvestNFTContract) Ownable(msg.sender) {
        require(_harvestNFTContract != address(0), "Invalid NFT contract");
        harvestNFTContract = IHarvestTokenNFT(_harvestNFTContract);
        
        // Set default max loan amounts per level (in HBAR wei - 18 decimals)
        levelMaxLoan[1] = 2000 * 1e18;    // Level 1: 2,000 HBAR
        levelMaxLoan[2] = 5000 * 1e18;    // Level 2: 5,000 HBAR
        levelMaxLoan[3] = 20000 * 1e18;   // Level 3: 20,000 HBAR
        levelMaxLoan[4] = type(uint256).max; // Level 4: Unlimited
        
        // Set default verification for contract owner
        farmerVerifications[msg.sender] = FarmerVerification({
            level: 1,
            documentHash: bytes32(0),
            verifiedAt: block.timestamp,
            verifier: msg.sender,
            isActive: true
        });
    }
    
    /**
     * @notice Update HTS NFT contract address (only owner)
     */
    function setHarvestNFTContract(address _harvestNFTContract) external onlyOwner {
        require(_harvestNFTContract != address(0), "Invalid address");
        harvestNFTContract = IHarvestTokenNFT(_harvestNFTContract);
    }
    
    function setVerification(
        address farmer,
        uint8 level,
        bytes32 documentHash
    ) external onlyOwner {
        require(level >= 1 && level <= 4, "Invalid level");
        
        farmerVerifications[farmer] = FarmerVerification({
            level: level,
            documentHash: documentHash,
            verifiedAt: block.timestamp,
            verifier: msg.sender,
            isActive: true
        });
    }
    
    function getVerificationLevel(address farmer) public view returns (uint8) {
        if (!farmerVerifications[farmer].isActive) {
            return 1; // Default to basic
        }
        return farmerVerifications[farmer].level;
    }
    
    function getMaxLoanAmount(address farmer) public view returns (uint256) {
        uint8 level = getVerificationLevel(farmer);
        return levelMaxLoan[level];
    }
    
    /**
     * @notice Create legacy harvest token (backward compatibility)
     */
    function createHarvestToken(
        address _tokenAddress,
        string memory _cropType,
        uint256 _expectedYield,
        uint256 _estimatedValue,
        uint256 _harvestDate
    ) external returns (uint256) {
        require(_harvestDate > block.timestamp, "Harvest date must be in future");
        
        uint256 tokenId = harvestTokenCounter++;
        
        harvestTokens[tokenId] = HarvestToken({
            tokenAddress: _tokenAddress,
            cropType: _cropType,
            expectedYield: _expectedYield,
            estimatedValue: _estimatedValue,
            harvestDate: _harvestDate,
            farmer: msg.sender,
            isActive: true,
            isHTSNFT: false,
            htsInternalId: 0
        });
        
        emit HarvestTokenCreated(tokenId, msg.sender, _cropType);
        return tokenId;
    }
    
    /**
     * @notice Create harvest token from HTS NFT
     * @dev Called after NFT is created via Hedera SDK and registered
     */
    function createHarvestTokenFromNFT(uint256 _htsInternalId) external returns (uint256) {
        // Get NFT metadata from HTS contract
        IHarvestTokenNFT.HarvestMetadata memory nftData = harvestNFTContract.getHarvestNFT(_htsInternalId);
        
        // Verify ownership
        require(harvestNFTContract.isNFTOwner(_htsInternalId, msg.sender), "Not NFT owner");
        require(nftData.isActive, "NFT not active");
        require(nftData.harvestDate > block.timestamp, "Harvest date must be in future");
        
        uint256 tokenId = harvestTokenCounter++;
        
        harvestTokens[tokenId] = HarvestToken({
            tokenAddress: address(0), // Not used for HTS NFTs
            cropType: nftData.cropType,
            expectedYield: nftData.expectedYield,
            estimatedValue: nftData.estimatedValue,
            harvestDate: nftData.harvestDate,
            farmer: msg.sender,
            isActive: true,
            isHTSNFT: true,
            htsInternalId: _htsInternalId
        });
        
        emit HarvestTokenCreated(tokenId, msg.sender, nftData.cropType);
        return tokenId;
    }
    
    function requestLoan(
        uint256 _harvestTokenId,
        uint256 _requestedAmount,
        uint256 _interestRate,
        uint256 _duration
    ) external returns (uint256) {
        HarvestToken storage token = harvestTokens[_harvestTokenId];
        require(token.isActive, "Harvest token not active");
        require(token.farmer == msg.sender, "Not token owner");
        require(_requestedAmount <= token.estimatedValue * 70 / 100, "Amount exceeds 70% collateral");
        
        uint256 maxLoan = getMaxLoanAmount(msg.sender);
        require(_requestedAmount <= maxLoan, "Amount exceeds verification level limit");
        
        // If HTS NFT, deactivate it (lock as collateral)
        if (token.isHTSNFT) {
            harvestNFTContract.deactivateNFT(token.htsInternalId);
        }
        
        uint256 loanId = loanRequestCounter++;
        
        loanRequests[loanId] = LoanRequest({
            id: loanId,
            farmer: msg.sender,
            harvestTokenId: _harvestTokenId,
            requestedAmount: _requestedAmount,
            interestRate: _interestRate,
            duration: _duration,
            collateralValue: token.estimatedValue,
            status: LoanStatus.Pending,
            fundedAmount: 0,
            createdAt: block.timestamp
        });
        
        farmerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, _requestedAmount);
        return loanId;
    }
    
    /**
     * @notice Invest in a loan
     * @dev Hedera Fix: msg.value is in tinybar, convert to wei for internal storage
     */
    function investInLoan(uint256 _loanId) external payable nonReentrant {
        LoanRequest storage loan = loanRequests[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan not available");
        require(msg.value > 0, "Investment amount must be > 0");
        
        // CRITICAL: Hedera EVM sends msg.value in tinybar, convert to wei
        uint256 investmentAmountWei = msg.value * TINYBAR_TO_WEI;
        
        uint256 remainingAmount = loan.requestedAmount - loan.fundedAmount;
        uint256 investmentAmount = investmentAmountWei > remainingAmount ? remainingAmount : investmentAmountWei;
        
        loan.fundedAmount += investmentAmount;
        totalValueLocked += investmentAmount;
        
        loanInvestments[_loanId].push(Investment({
            investor: msg.sender,
            loanId: _loanId,
            amount: investmentAmount,
            investedAt: block.timestamp,
            withdrawn: false
        }));
        
        investorInvestments[msg.sender].push(_loanId);
        
        if (loan.fundedAmount >= loan.requestedAmount) {
            loan.status = LoanStatus.Funded;
            // Convert wei back to tinybar for transfer
            payable(loan.farmer).transfer(loan.requestedAmount / TINYBAR_TO_WEI);
        }
        
        if (investmentAmountWei > investmentAmount) {
            // Refund excess - convert wei back to tinybar
            uint256 excessWei = investmentAmountWei - investmentAmount;
            payable(msg.sender).transfer(excessWei / TINYBAR_TO_WEI);
        }
        
        emit LoanFunded(_loanId, msg.sender, investmentAmount);
    }
    
    /**
     * @notice Repay a loan with interest
     * @dev Hedera Fix: msg.value is in tinybar, convert to wei for calculations
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        LoanRequest storage loan = loanRequests[_loanId];
        require(loan.farmer == msg.sender, "Not loan owner");
        require(loan.status == LoanStatus.Funded, "Loan not funded");
        
        // Convert tinybar to wei
        uint256 repaymentWei = msg.value * TINYBAR_TO_WEI;
        
        uint256 interest = (loan.requestedAmount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.requestedAmount + interest;
        
        require(repaymentWei >= totalRepayment, "Insufficient repayment amount");
        
        loan.status = LoanStatus.Repaid;
        
        // If HTS NFT, reactivate it (unlock collateral)
        HarvestToken storage token = harvestTokens[loan.harvestTokenId];
        if (token.isHTSNFT) {
            harvestNFTContract.reactivateNFT(token.htsInternalId);
        }
        
        emit LoanRepaid(_loanId, totalRepayment);
        
        if (repaymentWei > totalRepayment) {
            // Refund excess - convert wei back to tinybar
            payable(msg.sender).transfer((repaymentWei - totalRepayment) / TINYBAR_TO_WEI);
        }
    }
    
    /**
     * @notice Withdraw investment after loan is repaid
     * @dev Hedera Fix: Convert wei to tinybar for transfer
     */
    function withdrawInvestment(uint256 _loanId, uint256 _investmentIndex) external nonReentrant {
        LoanRequest memory loan = loanRequests[_loanId];
        require(loan.status == LoanStatus.Repaid, "Loan not repaid");
        
        Investment storage investment = loanInvestments[_loanId][_investmentIndex];
        require(investment.investor == msg.sender, "Not investment owner");
        require(!investment.withdrawn, "Already withdrawn");
        
        uint256 interest = (loan.requestedAmount * loan.interestRate) / 10000;
        uint256 totalRepayment = loan.requestedAmount + interest;
        uint256 investorShare = (investment.amount * totalRepayment) / loan.fundedAmount;
        
        investment.withdrawn = true;
        totalValueLocked -= investment.amount;
        
        // Convert wei back to tinybar for transfer
        payable(msg.sender).transfer(investorShare / TINYBAR_TO_WEI);
        
        emit InvestmentWithdrawn(_loanId, msg.sender, investorShare);
    }
    
    function getLoanDetails(uint256 _loanId) external view returns (LoanRequest memory) {
        return loanRequests[_loanId];
    }
    
    function getFarmerLoans(address _farmer) external view returns (uint256[] memory) {
        return farmerLoans[_farmer];
    }
    
    function getInvestorInvestments(address _investor) external view returns (uint256[] memory) {
        return investorInvestments[_investor];
    }
    
    function getLoanInvestments(uint256 _loanId) external view returns (Investment[] memory) {
        return loanInvestments[_loanId];
    }
    
    /**
     * @notice Get contract balance in wei (for frontend display)
     */
    function getContractBalanceWei() external view returns (uint256) {
        // Convert tinybar balance to wei for display
        return address(this).balance * TINYBAR_TO_WEI;
    }
    
    /**
     * @notice Emergency withdraw (only owner)
     * @dev Should only be used in critical situations
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
