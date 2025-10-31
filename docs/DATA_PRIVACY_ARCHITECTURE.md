# 🔐 Data Privacy & Storage Architecture

## Overview

Farmer verification data contains sensitive personal information (PII) that must be handled with extreme care. This document outlines the best practices for storing and managing this data.

## ⚠️ Critical Principle

**NEVER store sensitive personal data directly on public blockchain!**

Blockchain is:
- ✅ Perfect for: Verification status, hashes, timestamps
- ❌ NOT for: Personal info, documents, photos, addresses

## Recommended Architecture

### 1. Hybrid Storage Model (RECOMMENDED)

```
┌─────────────────────────────────────────────────────────┐
│                    USER SUBMITS KYC                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              ENCRYPTED OFF-CHAIN STORAGE                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  IPFS (Encrypted) or Private Database            │  │
│  │  - Personal documents (encrypted)                 │  │
│  │  - ID photos (encrypted)                          │  │
│  │  - Selfies (encrypted)                            │  │
│  │  - Land documents (encrypted)                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              HEDERA BLOCKCHAIN (PUBLIC)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ONLY STORE:                                      │  │
│  │  - Verification status (Level 1-4)                │  │
│  │  - Document hashes (SHA-256)                      │  │
│  │  - Verification timestamp                         │  │
│  │  - Verifier address                               │  │
│  │  - IPFS CID (if using IPFS)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Storage Solutions

### Option 1: IPFS + Encryption (BEST for Decentralization)

**Technology Stack:**
- IPFS (InterPlanetary File System)
- AES-256 encryption
- Hedera File Service (optional)
- Lit Protocol for access control

**How it works:**

```typescript
// 1. Encrypt document
const encryptedDoc = await encryptFile(document, userPublicKey)

// 2. Upload to IPFS
const ipfsCID = await ipfs.add(encryptedDoc)

// 3. Store hash on Hedera
const documentHash = sha256(document)
await hederaContract.storeVerification(
  farmerAddress,
  documentHash,
  ipfsCID,
  verificationLevel
)
```

**Pros:**
- ✅ Decentralized storage
- ✅ Censorship resistant
- ✅ User owns their data
- ✅ Can be encrypted
- ✅ Immutable

**Cons:**
- ❌ Requires encryption layer
- ❌ IPFS pinning costs
- ❌ Complex key management

**Services:**
- [Pinata](https://pinata.cloud) - IPFS pinning
- [Web3.Storage](https://web3.storage) - Free IPFS storage
- [Lit Protocol](https://litprotocol.com) - Decentralized access control

### Option 2: Hedera File Service (HFS)

**Hedera File Service:**
- Store files directly on Hedera
- Immutable storage
- Low cost (~$0.05 per KB)
- Built-in consensus

**How it works:**

```typescript
import { FileCreateTransaction } from '@hashgraph/sdk'

// 1. Encrypt document
const encryptedDoc = await encryptFile(document)

// 2. Create file on Hedera
const fileCreateTx = await new FileCreateTransaction()
  .setKeys([operatorKey])
  .setContents(encryptedDoc)
  .execute(client)

const fileId = (await fileCreateTx.getReceipt(client)).fileId

// 3. Store reference in smart contract
await contract.storeVerification(
  farmerAddress,
  documentHash,
  fileId.toString(),
  verificationLevel
)
```

**Pros:**
- ✅ Native Hedera integration
- ✅ High security (aBFT)
- ✅ Immutable
- ✅ Fast retrieval

**Cons:**
- ❌ Storage costs
- ❌ File size limits (1MB per file)
- ❌ Still needs encryption

### Option 3: Private Database + Hedera (MOST PRACTICAL)

**Technology Stack:**
- PostgreSQL/MongoDB (encrypted at rest)
- AWS S3/Google Cloud Storage (encrypted)
- Hedera for verification status only
- HSM for key management

**Architecture:**

```typescript
// 1. Store documents in encrypted database
const documentId = await database.storeDocument({
  farmerId: farmerAddress,
  documentType: 'ID_CARD',
  encryptedData: encryptedDocument,
  encryptionKeyId: keyId
})

// 2. Generate hash
const documentHash = sha256(originalDocument)

// 3. Store only hash on Hedera
await hederaContract.storeVerification(
  farmerAddress,
  documentHash,
  verificationLevel,
  timestamp
)
```

**Pros:**
- ✅ Most practical for MVP
- ✅ Fast retrieval
- ✅ Easy to implement
- ✅ GDPR compliant (can delete)
- ✅ Lower costs
- ✅ Familiar technology

**Cons:**
- ❌ Centralized storage
- ❌ Trust in database provider
- ❌ Single point of failure

**Security Measures:**
- Encryption at rest (AES-256)
- Encryption in transit (TLS)
- Access control (RBAC)
- Audit logs
- Regular backups
- HSM for key storage

## Hedera-Specific Technologies

### 1. Hedera Consensus Service (HCS)

**Use for:**
- Audit trail of verification events
- Timestamping verification submissions
- Immutable log of status changes

```typescript
const message = {
  farmerId: farmerAddress,
  action: 'VERIFICATION_SUBMITTED',
  level: 2,
  timestamp: Date.now(),
  documentHashes: [hash1, hash2, hash3]
}

await new TopicMessageSubmitTransaction()
  .setTopicId(verificationTopicId)
  .setMessage(JSON.stringify(message))
  .execute(client)
```

**Benefits:**
- ✅ Immutable audit trail
- ✅ Very low cost (~$0.0001)
- ✅ Timestamped by consensus
- ✅ Public verifiability

### 2. Hedera Token Service (HTS)

**Use for:**
- Verification badges as NFTs
- Soulbound tokens (non-transferable)
- Level badges

```typescript
// Create verification badge NFT
const nftCreate = await new TokenCreateTransaction()
  .setTokenName("AgriChain Verified Farmer")
  .setTokenSymbol("ACVF")
  .setTokenType(TokenType.NonFungibleUnique)
  .setSupplyKey(supplyKey)
  .execute(client)

// Mint badge for verified farmer
await new TokenMintTransaction()
  .setTokenId(tokenId)
  .setMetadata([Buffer.from(JSON.stringify({
    level: 2,
    verifiedAt: timestamp,
    documentHash: hash
  }))])
  .execute(client)
```

### 3. Hedera Smart Contract Service

**Store on-chain:**
```solidity
contract FarmerVerification {
    struct Verification {
        address farmer;
        uint8 level;              // 1-4
        bytes32 documentHash;     // SHA-256 hash
        string ipfsCID;           // IPFS reference (if used)
        uint256 verifiedAt;
        address verifier;
        bool isActive;
    }
    
    mapping(address => Verification) public verifications;
    
    // Store only hash, not actual data
    function submitVerification(
        address farmer,
        uint8 level,
        bytes32 documentHash,
        string memory ipfsCID
    ) external onlyVerifier {
        verifications[farmer] = Verification({
            farmer: farmer,
            level: level,
            documentHash: documentHash,
            ipfsCID: ipfsCID,
            verifiedAt: block.timestamp,
            verifier: msg.sender,
            isActive: true
        });
    }
}
```

## Recommended Implementation (Phase by Phase)

### Phase 1: MVP (Current)

**Storage:**
- Private encrypted database (PostgreSQL)
- AWS S3 for documents (encrypted)
- Document hashes on Hedera smart contract

**Why:**
- Fast to implement
- GDPR compliant
- Cost effective
- Familiar technology

### Phase 2: Hybrid

**Storage:**
- Keep database for fast access
- Add IPFS for document backup
- HCS for audit trail
- Smart contract for verification status

**Why:**
- More decentralized
- Better transparency
- Redundancy
- Still practical

### Phase 3: Fully Decentralized

**Storage:**
- IPFS + Lit Protocol for documents
- HCS for all events
- HTS for verification badges
- Smart contract for everything

**Why:**
- Maximum decentralization
- User owns data
- Censorship resistant
- True Web3

## Encryption Strategy

### Document Encryption

```typescript
import { encrypt, decrypt } from '@metamask/eth-sig-util'

// Encrypt with farmer's public key
async function encryptDocument(document: File, publicKey: string) {
  const buffer = await document.arrayBuffer()
  const encrypted = encrypt({
    publicKey: publicKey,
    data: Buffer.from(buffer).toString('base64'),
    version: 'x25519-xsalsa20-poly1305'
  })
  return JSON.stringify(encrypted)
}

// Only farmer can decrypt with their private key
async function decryptDocument(encryptedData: string, privateKey: string) {
  const encrypted = JSON.parse(encryptedData)
  const decrypted = decrypt({
    encryptedData: encrypted,
    privateKey: privateKey
  })
  return Buffer.from(decrypted, 'base64')
}
```

### Key Management

**Options:**

1. **User's Wallet Key** (Most Decentralized)
   - Encrypt with farmer's public key
   - Only farmer can decrypt
   - No key management needed

2. **Platform Key + User Key** (Hybrid)
   - Dual encryption
   - Platform can access for verification
   - User can access anytime

3. **HSM (Hardware Security Module)** (Enterprise)
   - Keys stored in hardware
   - Highest security
   - Expensive

## GDPR Compliance

### Right to be Forgotten

**Challenge:** Blockchain is immutable

**Solution:**
```typescript
// Store only hash on-chain
const documentHash = sha256(document)

// Store encrypted document off-chain
const encryptedDoc = await encrypt(document)
await database.store(encryptedDoc)

// To "delete": 
// 1. Delete from database ✅
// 2. Hash remains on-chain (no PII) ✅
// 3. Document is unrecoverable ✅
```

### Data Minimization

**Only collect what's necessary:**
- ✅ ID number (not full ID image if possible)
- ✅ Phone number (for verification)
- ✅ Location (general area, not exact GPS)
- ❌ Don't store: SSN, bank details, etc.

## Access Control

### Who Can Access What?

```typescript
enum AccessLevel {
  FARMER = 1,      // Can view own data
  VERIFIER = 2,    // Can view for verification
  ADMIN = 3,       // Can view for support
  AUDITOR = 4      // Can view hashes only
}

// Implement strict RBAC
async function getDocument(documentId, userId, userRole) {
  // Check permissions
  if (userRole === AccessLevel.FARMER) {
    // Can only access own documents
    if (document.ownerId !== userId) throw new Error('Unauthorized')
  }
  
  // Log access
  await auditLog.create({
    userId,
    action: 'DOCUMENT_ACCESS',
    documentId,
    timestamp: Date.now()
  })
  
  return document
}
```

## Audit Trail

### Use Hedera Consensus Service

```typescript
// Log every verification event
async function logVerificationEvent(event: VerificationEvent) {
  const message = {
    type: event.type,
    farmerId: event.farmerId,
    timestamp: Date.now(),
    documentHash: sha256(event.document),
    verifier: event.verifier
  }
  
  // Submit to HCS topic
  await new TopicMessageSubmitTransaction()
    .setTopicId(VERIFICATION_TOPIC_ID)
    .setMessage(JSON.stringify(message))
    .execute(client)
}
```

## Cost Comparison

### IPFS + Pinata
- Storage: $0.15/GB/month
- Pinning: Free tier available
- Retrieval: Free

### Hedera File Service
- Storage: ~$0.05 per KB (one-time)
- No monthly fees
- Fast retrieval

### AWS S3 (Encrypted)
- Storage: $0.023/GB/month
- Retrieval: $0.09/GB
- Encryption: Included

### Recommended for MVP
- **AWS S3**: $0.023/GB/month
- **PostgreSQL**: $15-50/month
- **Hedera Smart Contract**: $0.0001 per transaction
- **Total**: ~$50-100/month for 1000 farmers

## Security Checklist

- [ ] Encrypt all documents at rest
- [ ] Encrypt all data in transit (TLS)
- [ ] Use HSM or secure key management
- [ ] Implement RBAC (Role-Based Access Control)
- [ ] Log all access (audit trail)
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] GDPR compliance review
- [ ] Data retention policy
- [ ] Incident response plan
- [ ] Regular backups
- [ ] Disaster recovery plan

## Recommended Solution for AgriChain Finance

### Phase 1 (MVP):
```
Documents → AWS S3 (Encrypted)
Metadata → PostgreSQL (Encrypted)
Verification Status → Hedera Smart Contract
Audit Trail → Hedera Consensus Service
```

### Phase 2 (Production):
```
Documents → IPFS (Encrypted) + S3 Backup
Metadata → PostgreSQL (Encrypted)
Verification Status → Hedera Smart Contract
Verification Badges → Hedera Token Service (NFT)
Audit Trail → Hedera Consensus Service
Access Control → Lit Protocol
```

## Conclusion

**Best Practice:**
1. ✅ Store sensitive data OFF-CHAIN (encrypted)
2. ✅ Store only hashes ON-CHAIN (Hedera)
3. ✅ Use HCS for audit trail
4. ✅ Use HTS for verification badges
5. ✅ Implement proper encryption
6. ✅ GDPR compliant architecture

**Hedera provides:**
- ✅ Verification status storage (Smart Contract)
- ✅ Audit trail (HCS)
- ✅ Verification badges (HTS)
- ✅ Timestamping (HCS)
- ❌ NOT for: Actual documents/photos

**Remember:** Privacy first, blockchain second!

---

For implementation details, see:
- `docs/FARMER_VERIFICATION.md` - Verification process
- `docs/SECURITY.md` - Security best practices
- `docs/HEDERA_INTEGRATION.md` - Hedera-specific implementation
