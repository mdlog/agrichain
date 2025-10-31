# 🎨 Frontend Documentation

## Overview

Frontend AgriChain Finance dibangun dengan Next.js 14 (App Router), TypeScript, dan TailwindCSS untuk memberikan pengalaman user yang modern dan responsif.

## Tech Stack

- **Framework**: Next.js 14 dengan App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Blockchain**: Ethers.js v6
- **Wallet**: HashConnect / MetaMask
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── marketplace/         # Marketplace page
│   │   └── page.tsx
│   ├── farmer/              # Farmer dashboard
│   │   └── page.tsx
│   ├── investor/            # Investor dashboard
│   │   └── page.tsx
│   └── about/               # About page
│       └── page.tsx
├── components/              # Reusable components
│   ├── Navbar.tsx          # Navigation bar
│   └── Footer.tsx          # Footer
├── context/                # React Context
│   └── WalletContext.tsx   # Wallet connection state
├── lib/                    # Utilities
│   ├── contract.ts         # Contract interaction helpers
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript types
│   └── window.d.ts         # Window type extensions
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Pages

### 1. Landing Page (`/`)

**Features:**
- Hero section dengan CTA buttons
- Statistics showcase
- Feature highlights (6 cards)
- How it works (6 steps)
- Call to action section

**Components:**
- FeatureCard
- Step

### 2. Marketplace (`/marketplace`)

**Features:**
- Browse all available loans
- Search by crop type
- Filter by status (All, Active, Funded)
- Loan cards dengan progress bar
- Real-time funding status

**Components:**
- LoanCard
- Search input
- Filter buttons

### 3. Farmer Dashboard (`/farmer`)

**Features:**
- Create harvest token form
- Request loan form
- View my loans
- Track loan status
- Repayment interface

**Components:**
- CreateLoanForm (2-step wizard)
- MyLoans list

**Flow:**
1. Connect wallet
2. Create harvest token (crop type, yield, value, date)
3. Request loan (amount, interest, duration)
4. Wait for funding
5. Repay after harvest

### 4. Investor Dashboard (`/investor`)

**Features:**
- Portfolio overview
- Investment statistics (4 stat cards)
- My investments list
- Available loans to invest
- Withdraw returns

**Components:**
- StatCard
- Portfolio
- AvailableLoans

**Flow:**
1. Connect wallet
2. Browse available loans
3. Invest in selected loan
4. Track investment progress
5. Withdraw returns after repayment

### 5. About Page (`/about`)

**Features:**
- Mission statement
- Problem & solution
- Why Hedera
- Impact goals
- Team info

## Components

### Navbar

**Features:**
- Logo & branding
- Navigation links
- Wallet connection button
- Mobile responsive menu
- Account display (truncated address)

**Props:** None (uses WalletContext)

### Footer

**Features:**
- Quick links
- Resources
- Social media links
- Copyright info

**Props:** None

### WalletContext

**State:**
- `account`: Connected wallet address
- `provider`: Ethers provider
- `signer`: Ethers signer

**Methods:**
- `connectWallet()`: Connect to wallet
- `disconnectWallet()`: Disconnect wallet

**Usage:**
```tsx
import { useWallet } from '@/context/WalletContext'

function MyComponent() {
  const { account, connectWallet } = useWallet()
  
  if (!account) {
    return <button onClick={connectWallet}>Connect</button>
  }
  
  return <div>Connected: {account}</div>
}
```

## Contract Integration

### Setup

```typescript
import { getContract } from '@/lib/contract'
import { useWallet } from '@/context/WalletContext'

const { signer } = useWallet()
const contract = getContract(signer)
```

### Create Harvest Token

```typescript
const tx = await contract.createHarvestToken(
  ethers.ZeroAddress,
  "Corn",
  2000,
  200000,
  harvestTimestamp
)
await tx.wait()
```

### Request Loan

```typescript
const tx = await contract.requestLoan(
  harvestTokenId,
  140000,
  500,
  90
)
await tx.wait()
```

### Invest in Loan

```typescript
const tx = await contract.investInLoan(loanId, {
  value: ethers.parseEther("0.7")
})
await tx.wait()
```

### Repay Loan

```typescript
const tx = await contract.repayLoan(loanId, {
  value: ethers.parseEther("1.47")
})
await tx.wait()
```

### Withdraw Investment

```typescript
const tx = await contract.withdrawInvestment(loanId, investmentIndex)
await tx.wait()
```

## Styling

### TailwindCSS Custom Classes

```css
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white 
         font-semibold py-2 px-6 rounded-lg 
         transition-colors duration-200;
}

.btn-secondary {
  @apply bg-white hover:bg-gray-50 text-primary-600 
         font-semibold py-2 px-6 rounded-lg 
         border-2 border-primary-600 
         transition-colors duration-200;
}

.card {
  @apply bg-white rounded-xl shadow-md p-6 
         border border-gray-200;
}

.input {
  @apply w-full px-4 py-2 border border-gray-300 
         rounded-lg focus:ring-2 focus:ring-primary-500 
         focus:border-transparent outline-none;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}
```

### Color Palette

```javascript
primary: {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',  // Main brand color
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
}
```

## Utilities

### formatAddress

```typescript
formatAddress('0x1234567890abcdef1234567890abcdef12345678')
// Returns: '0x1234...5678'
```

### formatCurrency

```typescript
formatCurrency(1400)
// Returns: '$1,400.00'
```

### formatDate

```typescript
formatDate(1735689600)
// Returns: 'Jan 1, 2025'
```

### calculateInterest

```typescript
calculateInterest(1400, 500) // 500 basis points = 5%
// Returns: 70
```

### getLoanStatusText

```typescript
getLoanStatusText(0) // Returns: 'Pending'
getLoanStatusText(1) // Returns: 'Funded'
getLoanStatusText(2) // Returns: 'Repaid'
```

## Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

## Error Handling

### Toast Notifications

```typescript
import toast from 'react-hot-toast'

// Success
toast.success('Transaction successful!')

// Error
toast.error('Transaction failed')

// Loading
const toastId = toast.loading('Processing...')
// Later...
toast.success('Done!', { id: toastId })
```

### Try-Catch Pattern

```typescript
const handleTransaction = async () => {
  try {
    const tx = await contract.someFunction()
    toast.loading('Processing transaction...')
    await tx.wait()
    toast.success('Transaction successful!')
  } catch (error: any) {
    console.error(error)
    toast.error(error.message || 'Transaction failed')
  }
}
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits by route.

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority
/>
```

### Loading States

```tsx
{loading ? (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
) : (
  <Content />
)}
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_HEDERA_NETWORK`

## Future Enhancements

- [ ] Loan detail page (`/loan/[id]`)
- [ ] Transaction history
- [ ] User profile page
- [ ] Notification system
- [ ] Dark mode
- [ ] Multi-language support
- [ ] PWA support
- [ ] Real-time updates (WebSocket)
- [ ] Advanced filtering & sorting
- [ ] Export data (CSV, PDF)

## Testing

```bash
# Run tests (coming soon)
npm test

# Run E2E tests (coming soon)
npm run test:e2e
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
