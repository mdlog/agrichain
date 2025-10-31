# 🚀 Setup Guide - AgriChain Finance

## Prerequisites

### 1. Install Node.js
```bash
# Check if installed
node --version  # Should be v18 or higher
npm --version
```

### 2. Create Hedera Testnet Account

1. Kunjungi [Hedera Portal](https://portal.hedera.com)
2. Sign up / Login
3. Buat testnet account
4. Dapatkan:
   - Account ID (format: 0.0.xxxxx)
   - Private Key (format: 302e020100...)
5. Claim testnet HBAR dari faucet

### 3. Install Dependencies

```bash
# Clone atau buat project
cd agrichain-finance

# Install dependencies
npm install
```

## Configuration

### 1. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env
```

Isi dengan credentials Anda:
```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e020100300506032b657004220420xxxxxxxx
HEDERA_NETWORK=testnet
```

### 2. Compile Smart Contract

```bash
npm run compile
```

Output:
```
Compiled 1 Solidity file successfully
```

### 3. Deploy to Hedera Testnet

```bash
npm run deploy:testnet
```

Output akan menampilkan contract address:
```
✅ AgriChainFinance deployed to: 0x...
```

Copy contract address dan update di `.env`:
```env
CONTRACT_ID=0x...
```

## Verification

### Test Contract Deployment

```bash
# Run interaction script
node scripts/interact.js
```

### Run Tests (Optional)

```bash
npm test
```

## Troubleshooting

### Error: "Insufficient balance"
- Pastikan account Anda punya testnet HBAR
- Claim dari faucet: https://portal.hedera.com

### Error: "Invalid private key"
- Check format private key di .env
- Pastikan tidak ada spasi atau newline

### Error: "Network timeout"
- Check koneksi internet
- Coba lagi beberapa saat

## Next Steps

1. ✅ Contract deployed
2. 📱 Setup frontend (coming soon)
3. 🧪 Test dengan sample data
4. 🚀 Deploy to mainnet (production)

## Useful Links

- [Hedera Docs](https://docs.hedera.com)
- [Hedera SDK](https://github.com/hashgraph/hedera-sdk-js)
- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org)
