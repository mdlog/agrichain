# 📚 API Documentation - AgriChain Finance

## Smart Contract Functions

### For Farmers

#### 1. createHarvestToken()

Membuat token yang merepresentasikan hasil panen masa depan.

**Parameters:**
```solidity
address _tokenAddress    // Address token HTS (use 0x0 for native)
string _cropType        // Jenis tanaman (e.g., "Corn", "Rice")
uint256 _expectedYield  // Estimasi hasil panen dalam kg
uint256 _estimatedValue // Nilai estimasi dalam USD cents
uint256 _harvestDate    // Unix timestamp tanggal panen
```

**Returns:** `uint256` - Token ID

**Example:**
```javascript
const tx = await contract.createHarvestToken(
  "0x0000000000000000000000000000000000000000",
  "Corn",
  1000,  // 1000 kg
  200000, // $2000 (dalam cents)
  1735689600 // Jan 1, 2025
);
```

#### 2. requestLoan()

Mengajukan pinjaman dengan jaminan harvest token.

**Parameters:**
```solidity
uint256 _harvestTokenId  // ID harvest token sebagai jaminan
uint256 _requestedAmount // Jumlah pinjaman (max 70% dari collateral)
uint256 _interestRate    // Bunga dalam basis points (500 = 5%)
uint256 _duration        // Durasi pinjaman dalam hari
```

**Returns:** `uint256` - Loan ID

**Example:**
```javascript
const tx = await contract.requestLoan(
  0,      // harvestTokenId
  140000, // $1400
  500,    // 5% interest
  90      // 90 days
);
```

#### 3. repayLoan()

Membayar kembali pinjaman beserta bunga.

**Parameters:**
```solidity
uint256 _loanId  // ID pinjaman yang akan dibayar
```

**Payable:** Ya (kirim HBAR untuk repayment)

**Example:**
```javascript
const repaymentAmount = ethers.parseEther("1.47"); // $1470 in HBAR
const tx = await contract.repayLoan(0, { value: repaymentAmount });
```

---

### For Investors

#### 4. investInLoan()

Investasi ke pinjaman petani.

**Parameters:**
```solidity
uint256 _loanId  // ID pinjaman yang akan didanai
```

**Payable:** Ya (kirim HBAR sebagai investasi)

**Example:**
```javascript
const investAmount = ethers.parseEther("0.7"); // $700 in HBAR
const tx = await contract.investInLoan(0, { value: investAmount });
```

#### 5. withdrawInvestment()

Menarik investasi beserta profit setelah loan repaid.

**Parameters:**
```solidity
uint256 _loanId          // ID pinjaman
uint256 _investmentIndex // Index investasi Anda di loan tersebut
```

**Example:**
```javascript
const tx = await contract.withdrawInvestment(0, 0);
```

---

### View Functions

#### 6. getLoanDetails()

Mendapatkan detail lengkap pinjaman.

**Parameters:**
```solidity
uint256 _loanId
```

**Returns:** `LoanRequest` struct

**Example:**
```javascript
const loan = await contract.getLoanDetails(0);
console.log(loan.farmer);
console.log(loan.requestedAmount);
console.log(loan.status);
```

#### 7. getFarmerLoans()

Mendapatkan semua loan IDs milik petani.

**Parameters:**
```solidity
address _farmer
```

**Returns:** `uint256[]` - Array of loan IDs

#### 8. getInvestorInvestments()

Mendapatkan semua loan IDs yang diinvestasi oleh investor.

**Parameters:**
```solidity
address _investor
```

**Returns:** `uint256[]` - Array of loan IDs

#### 9. getLoanInvestments()

Mendapatkan semua investasi untuk loan tertentu.

**Parameters:**
```solidity
uint256 _loanId
```

**Returns:** `Investment[]` - Array of investments

---

## Events

### HarvestTokenCreated
```solidity
event HarvestTokenCreated(
  uint256 indexed tokenId,
  address indexed farmer,
  string cropType
);
```

### LoanRequested
```solidity
event LoanRequested(
  uint256 indexed loanId,
  address indexed farmer,
  uint256 amount
);
```

### LoanFunded
```solidity
event LoanFunded(
  uint256 indexed loanId,
  address indexed investor,
  uint256 amount
);
```

### LoanRepaid
```solidity
event LoanRepaid(
  uint256 indexed loanId,
  uint256 amount
);
```

### InvestmentWithdrawn
```solidity
event InvestmentWithdrawn(
  uint256 indexed loanId,
  address indexed investor,
  uint256 amount
);
```

---

## Error Handling

Common errors:
- `"Harvest date must be in future"` - Tanggal panen harus di masa depan
- `"Not token owner"` - Bukan pemilik harvest token
- `"Amount exceeds 70% collateral"` - Pinjaman melebihi 70% dari jaminan
- `"Loan not available"` - Loan sudah funded atau tidak aktif
- `"Insufficient repayment amount"` - Jumlah repayment kurang
- `"Already withdrawn"` - Investasi sudah ditarik
