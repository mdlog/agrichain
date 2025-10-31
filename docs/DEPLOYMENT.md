# 🚀 Deployment Guide

## Prerequisites

- Hedera Testnet/Mainnet account
- Node.js v18+
- Git
- Vercel account (for frontend)

## Backend Deployment (Smart Contract)

### 1. Setup Hedera Account

#### Testnet
1. Visit https://portal.hedera.com
2. Create account
3. Get Account ID (0.0.xxxxx)
4. Get Private Key
5. Claim testnet HBAR from faucet

#### Mainnet
1. Create Hedera mainnet account
2. Purchase HBAR from exchange
3. Transfer to your account
4. Keep private key secure

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env
nano .env
```

For **Testnet**:
```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e020100300506032b657004220420xxxxxxxx
HEDERA_NETWORK=testnet
```

For **Mainnet**:
```env
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=302e020100300506032b657004220420xxxxxxxx
HEDERA_NETWORK=mainnet
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Compile Contract

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 5. Deploy to Testnet

```bash
npm run deploy:testnet
```

Expected output:
```
🚀 Deploying AgriChain Finance to Hedera Testnet...
📝 Deploying contract...
✅ AgriChainFinance deployed to: 0xABC123...
```

**Save the contract address!**

### 6. Deploy to Mainnet

```bash
# Update hardhat.config.js
# Add mainnet configuration

# Deploy
npx hardhat run scripts/deploy.js --network mainnet
```

### 7. Verify Deployment

```bash
# Test contract interaction
node scripts/interact.js
```

### 8. Update Environment

Add contract address to `.env`:
```env
CONTRACT_ID=0xABC123...
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/agrichain-finance.git
git push -u origin main
```

#### 2. Connect to Vercel

1. Visit https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select `frontend` as root directory
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: .next

#### 3. Set Environment Variables

In Vercel dashboard, add:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123...
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_APP_NAME=AgriChain Finance
```

#### 4. Deploy

Click "Deploy" and wait for build to complete.

Your app will be live at: `https://your-project.vercel.app`

### Option 2: Manual Deployment

#### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
```

#### 2. Test Production Build

```bash
npm start
```

#### 3. Deploy to Server

Upload the following to your server:
- `.next/` folder
- `public/` folder
- `package.json`
- `next.config.js`

#### 4. Install Dependencies on Server

```bash
npm install --production
```

#### 5. Start Application

```bash
# Using PM2
pm2 start npm --name "agrichain" -- start

# Or using systemd
sudo systemctl start agrichain
```

### Option 3: Docker

#### 1. Create Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Build Image

```bash
cd frontend
docker build -t agrichain-frontend .
```

#### 3. Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CONTRACT_ADDRESS=0xABC123... \
  -e NEXT_PUBLIC_HEDERA_NETWORK=testnet \
  agrichain-frontend
```

## Post-Deployment

### 1. Test All Features

- [ ] Connect wallet
- [ ] Create harvest token
- [ ] Request loan
- [ ] Invest in loan
- [ ] Repay loan
- [ ] Withdraw investment

### 2. Monitor

#### Smart Contract
- Check transactions on HashScan
- Monitor gas usage
- Track total value locked

#### Frontend
- Check Vercel analytics
- Monitor error logs
- Track user metrics

### 3. Update DNS (Optional)

Point your domain to Vercel:
1. Add domain in Vercel dashboard
2. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Mainnet Checklist

Before deploying to mainnet:

- [ ] **Security Audit** - Get contract audited
- [ ] **Testing** - Extensive testing on testnet
- [ ] **Insurance** - Consider smart contract insurance
- [ ] **Legal** - Consult legal advisor
- [ ] **Backup** - Backup all keys and configs
- [ ] **Monitoring** - Setup monitoring tools
- [ ] **Support** - Prepare customer support
- [ ] **Documentation** - Update all docs with mainnet info

## Troubleshooting

### Contract Deployment Failed

**Error**: "Insufficient balance"
- **Solution**: Add more HBAR to your account

**Error**: "Invalid private key"
- **Solution**: Check .env format, ensure no spaces

**Error**: "Network timeout"
- **Solution**: Check internet connection, try again

### Frontend Build Failed

**Error**: "Module not found"
- **Solution**: Run `npm install` again

**Error**: "Environment variable not found"
- **Solution**: Check .env file exists and has correct values

**Error**: "Build timeout"
- **Solution**: Increase Vercel timeout in settings

### Wallet Connection Issues

**Error**: "No wallet detected"
- **Solution**: Install HashPack or MetaMask

**Error**: "Wrong network"
- **Solution**: Switch wallet to Hedera testnet/mainnet

**Error**: "Transaction failed"
- **Solution**: Check account has sufficient HBAR

## Monitoring & Maintenance

### Smart Contract

#### HashScan
- Testnet: https://hashscan.io/testnet
- Mainnet: https://hashscan.io/mainnet

Monitor:
- Transaction count
- Total value locked
- Active loans
- Error rate

#### Alerts

Setup alerts for:
- Large transactions
- Failed transactions
- Unusual activity
- Low balance

### Frontend

#### Vercel Analytics
- Page views
- Unique visitors
- Performance metrics
- Error rate

#### Error Tracking

Consider integrating:
- Sentry
- LogRocket
- Datadog

## Backup & Recovery

### Smart Contract

**Backup**:
- Contract source code (Git)
- Deployment addresses
- ABI files
- Private keys (secure storage)

**Recovery**:
- Redeploy from source
- Migrate data if needed
- Update frontend config

### Frontend

**Backup**:
- Source code (Git)
- Environment variables
- Build artifacts
- Database (if any)

**Recovery**:
- Redeploy from Git
- Restore environment variables
- Rebuild application

## Scaling

### Smart Contract

- Monitor gas usage
- Optimize functions
- Consider upgradeable contracts
- Implement caching

### Frontend

- Enable CDN
- Optimize images
- Implement lazy loading
- Use edge functions

## Security

### Smart Contract

- Regular audits
- Bug bounty program
- Monitoring tools
- Emergency pause function

### Frontend

- HTTPS only
- CSP headers
- Rate limiting
- Input validation

## Cost Estimation

### Testnet (Free)
- Contract deployment: Free
- Transactions: Free
- Frontend hosting: Free (Vercel)

### Mainnet
- Contract deployment: ~$1
- Transaction (avg): $0.0001
- Frontend hosting: Free (Vercel)
- Domain: $10-15/year

### Monthly Operating Costs
- Monitoring: $0-50
- Infrastructure: $0-100
- Support: Variable
- Marketing: Variable

## Support

### Resources
- Hedera Docs: https://docs.hedera.com
- Hedera Discord: https://hedera.com/discord
- GitHub Issues: [Your repo]
- Email: your@email.com

### Getting Help
1. Check documentation
2. Search GitHub issues
3. Ask in Discord
4. Create new issue
5. Contact support

---

**Ready to deploy?** Follow this guide step by step and you'll have AgriChain Finance live in no time! 🚀
