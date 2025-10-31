# 🏗️ AgriChain Finance - Architecture

## System Overview

AgriChain Finance adalah platform DeFi yang menghubungkan petani dengan investor melalui tokenisasi hasil panen dan smart contract lending.

## Components

### 1. Smart Contract Layer

**AgriChainFinance.sol**
- Core contract untuk semua operasi
- Mengelola harvest tokens, loans, dan investments
- Automated repayment distribution

**Key Functions:**
```solidity
createHarvestToken()  // Petani tokenisasi hasil panen
requestLoan()         // Petani ajukan pinjaman
investInLoan()        // Investor danai pinjaman
repayLoan()           // Petani bayar pinjaman
withdrawInvestment()  // Investor tarik profit
```

### 2. Data Structures

**HarvestToken**
```
- tokenAddress: Address token HTS
- cropType: Jenis tanaman (Corn, Rice, dll)
- expectedYield: Estimasi hasil panen (kg)
- estimatedValue: Nilai estimasi (USD cents)
- harvestDate: Tanggal panen
- farmer: Address petani
- isActive: Status aktif
```

**LoanRequest**
```
- id: Loan ID
- farmer: Address petani
- harvestTokenId: ID token jaminan
- requestedAmount: Jumlah pinjaman
- interestRate: Bunga (basis points)
- duration: Durasi (hari)
- status: Pending/Funded/Repaid/Defaulted
- fundedAmount: Total dana terkumpul
```

**Investment**
```
- investor: Address investor
- loanId: ID pinjaman
- amount: Jumlah investasi
- investedAt: Timestamp
- withdrawn: Status penarikan
```

### 3. Flow Diagram

```
┌─────────┐
│ Petani  │
└────┬────┘
     │
     ├─► 1. Create Harvest Token
     │   (Tokenisasi hasil panen)
     │
     ├─► 2. Request Loan
     │   (Ajukan pinjaman dengan jaminan token)
     │
     ▼
┌──────────────┐
│ Smart        │
│ Contract     │◄──── 3. Invest in Loan
└──────┬───────┘      (Investor danai pinjaman)
       │              
       ├─► 4. Transfer funds to Farmer
       │
       ▼
┌─────────┐
│ Petani  │
└────┬────┘
     │
     ├─► 5. Repay Loan
     │   (Bayar pinjaman + bunga)
     │
     ▼
┌──────────────┐
│ Smart        │
│ Contract     │───► 6. Distribute to Investors
└──────────────┘     (Profit dibagi ke investor)
```

## Security Features

1. **ReentrancyGuard**: Proteksi dari reentrancy attacks
2. **Ownable**: Access control untuk admin functions
3. **Collateral Limit**: Max 70% dari nilai harvest token
4. **Status Checks**: Validasi status di setiap transaksi

## Hedera Integration

### Hedera Token Service (HTS)
- Digunakan untuk membuat harvest tokens
- Low cost token creation (~$0.001)
- Native token standard

### Smart Contract Service
- Deploy Solidity contract ke Hedera
- EVM compatible
- Fast finality (3-5 detik)

### Hedera Consensus Service (HCS) - Future
- Audit trail untuk semua transaksi
- Immutable record keeping
- Compliance & transparency

## Gas Optimization

- Menggunakan `uint256` untuk efisiensi
- Minimal storage operations
- Batch operations where possible
- Events untuk off-chain indexing

## Scalability

- Support multiple concurrent loans
- No limit on number of investors per loan
- Efficient mapping structures
- Off-chain data via events

## Future Enhancements

1. **Oracle Integration**: Real-time crop prices
2. **Insurance Module**: Crop failure protection
3. **Reputation System**: Credit scoring untuk petani
4. **Multi-token Support**: Accept stablecoins
5. **Governance**: DAO untuk platform decisions
