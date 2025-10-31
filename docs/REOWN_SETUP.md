# 🔗 Reown Wallet Integration Setup

## Overview

AgriChain Finance uses Reown (formerly WalletConnect) AppKit for wallet connections. This provides support for multiple wallets including MetaMask, WalletConnect, Coinbase Wallet, and more.

## Prerequisites

- Node.js v18+
- Reown Cloud account
- Frontend dependencies installed

## Step 1: Get Reown Project ID

### 1.1 Create Reown Cloud Account

1. Visit [Reown Cloud](https://cloud.reown.com)
2. Sign up or log in
3. Click "Create New Project"

### 1.2 Configure Project

```
Project Name: AgriChain Finance
Project Description: Decentralized Agricultural Financing Platform
Homepage URL: https://agrichain.finance (or your domain)
```

### 1.3 Get Project ID

After creating the project, you'll receive a **Project ID**. Copy this ID.

Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## Step 2: Configure Environment

### 2.1 Update .env.local

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_APP_NAME=AgriChain Finance
NEXT_PUBLIC_REOWN_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Replace `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` with your actual Project ID.

## Step 3: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `@reown/appkit` - Main AppKit library
- `@reown/appkit-adapter-ethers` - Ethers.js adapter
- `@tanstack/react-query` - Required for AppKit

## Step 4: Verify Configuration

### 4.1 Check reown-config.ts

File: `frontend/lib/reown-config.ts`

```typescript
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'
```

Make sure this reads from environment variable.

### 4.2 Supported Networks

Current configuration supports:
- ✅ Hedera Testnet (Chain ID: 296)
- ✅ Hedera Mainnet (Chain ID: 295)
- ✅ Sepolia (for testing)

## Step 5: Test Wallet Connection

### 5.1 Run Development Server

```bash
npm run dev
```

### 5.2 Test Connection

1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. Reown modal should appear
4. Select a wallet (MetaMask, WalletConnect, etc.)
5. Approve connection
6. Your address should appear in navbar

### 5.3 Expected Behavior

**Before Connection:**
- Button shows: "Connect Wallet"
- No address displayed

**After Connection:**
- Button shows: "0x1234...5678" (truncated address)
- Wallet icon appears
- Can interact with dApp features

## Step 6: Supported Wallets

Reown AppKit supports 300+ wallets including:

### Popular Wallets:
- ✅ MetaMask
- ✅ WalletConnect
- ✅ Coinbase Wallet
- ✅ Trust Wallet
- ✅ Rainbow
- ✅ Ledger
- ✅ Trezor

### Mobile Wallets:
- ✅ MetaMask Mobile
- ✅ Trust Wallet
- ✅ Coinbase Wallet
- ✅ Rainbow
- ✅ Argent

## Step 7: Network Switching

### Hedera Testnet Configuration

```typescript
const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HashScan',
      url: 'https://hashscan.io/testnet',
    },
  },
}
```

### Switch Network

Users can switch networks through:
1. Reown modal network selector
2. Wallet's network switcher
3. Programmatically (if needed)

## Step 8: Customization

### Theme Customization

Edit `frontend/lib/reown-config.ts`:

```typescript
themeMode: 'light', // or 'dark'
themeVariables: {
  '--w3m-accent': '#16a34a',           // Primary color
  '--w3m-border-radius-master': '8px', // Border radius
}
```

### Metadata

```typescript
const metadata = {
  name: 'AgriChain Finance',
  description: 'Decentralized Agricultural Financing Platform',
  url: 'https://agrichain.finance',
  icons: ['https://agrichain.finance/icon.png']
}
```

## Step 9: Usage in Components

### Get Wallet Info

```typescript
import { useWallet } from '@/context/WalletContext'

function MyComponent() {
  const { account, isConnected, provider, signer } = useWallet()
  
  if (!isConnected) {
    return <div>Please connect wallet</div>
  }
  
  return <div>Connected: {account}</div>
}
```

### Open Wallet Modal

```typescript
import { useAppKit } from '@reown/appkit/react'

function MyComponent() {
  const { open } = useAppKit()
  
  return (
    <button onClick={() => open()}>
      Connect Wallet
    </button>
  )
}
```

### Get Account Info

```typescript
import { useAppKitAccount } from '@reown/appkit/react'

function MyComponent() {
  const { address, isConnected, caipAddress } = useAppKitAccount()
  
  return (
    <div>
      {isConnected ? `Connected: ${address}` : 'Not connected'}
    </div>
  )
}
```

## Step 10: Smart Contract Interaction

### Read Contract

```typescript
import { useWallet } from '@/context/WalletContext'
import { Contract } from 'ethers'

async function readContract() {
  const { provider } = useWallet()
  
  const contract = new Contract(
    contractAddress,
    contractABI,
    provider
  )
  
  const data = await contract.someReadFunction()
  return data
}
```

### Write Contract

```typescript
import { useWallet } from '@/context/WalletContext'
import { Contract } from 'ethers'

async function writeContract() {
  const { signer } = useWallet()
  
  const contract = new Contract(
    contractAddress,
    contractABI,
    signer
  )
  
  const tx = await contract.someWriteFunction(params)
  await tx.wait()
  return tx
}
```

## Troubleshooting

### Issue: "Project ID not found"

**Solution:**
1. Check `.env.local` has correct Project ID
2. Restart development server
3. Clear browser cache

### Issue: "Network not supported"

**Solution:**
1. Add network to `reown-config.ts`
2. Ensure RPC URL is correct
3. Check chain ID matches

### Issue: "Wallet not connecting"

**Solution:**
1. Check wallet is installed
2. Try different wallet
3. Check browser console for errors
4. Ensure correct network selected

### Issue: "Transaction failing"

**Solution:**
1. Check wallet has sufficient HBAR
2. Verify contract address is correct
3. Check network is Hedera Testnet
4. Review transaction parameters

## Security Best Practices

### 1. Never Expose Private Keys
```typescript
// ❌ Bad
const privateKey = "0x..."

// ✅ Good - Let wallet handle keys
const signer = await provider.getSigner()
```

### 2. Validate User Input
```typescript
// ✅ Good
if (!ethers.isAddress(address)) {
  throw new Error('Invalid address')
}
```

### 3. Handle Errors Gracefully
```typescript
try {
  const tx = await contract.someFunction()
  await tx.wait()
} catch (error) {
  console.error('Transaction failed:', error)
  toast.error('Transaction failed')
}
```

### 4. Check Network
```typescript
const { chainId } = useWallet()

if (chainId !== 296) { // Hedera Testnet
  toast.error('Please switch to Hedera Testnet')
  return
}
```

## Production Deployment

### 1. Update Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourMainnetContractAddress
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXT_PUBLIC_REOWN_PROJECT_ID=your_production_project_id
```

### 2. Update Default Network

In `reown-config.ts`:
```typescript
defaultNetwork: hederaMainnet, // Change from testnet
```

### 3. Test Thoroughly

- [ ] Test wallet connection
- [ ] Test network switching
- [ ] Test all transactions
- [ ] Test on mobile
- [ ] Test with different wallets

## Resources

- [Reown Documentation](https://docs.reown.com)
- [Reown Cloud Dashboard](https://cloud.reown.com)
- [Hedera Documentation](https://docs.hedera.com)
- [Ethers.js Documentation](https://docs.ethers.org)

## Support

For issues:
1. Check [Reown Discord](https://discord.gg/reown)
2. Review [GitHub Issues](https://github.com/reown-com/appkit)
3. Contact AgriChain support

---

**Your wallet integration is now ready!** 🎉

Users can connect with 300+ wallets and interact with your dApp securely.
