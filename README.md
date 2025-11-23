# 🔐 VaultLink

> A decentralized password manager with tamper-proof frontend deployment via PinMe

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-success?style=for-the-badge)](https://iggepe6m.pinit.eth.limo)
[![Video Demo](https://img.shields.io/badge/▶️-Watch%20Demo-red?style=for-the-badge)](YOUR_YOUTUBE_LINK_HERE)

---

## 🎯 What is VaultLink?

VaultLink is a password manager that **can't be hacked, censored, or taken down**. Built with PinMe, IPFS, and blockchain technology.

### The Problem 🚨

Traditional password managers can be:
- ❌ Hacked through compromised frontends
- ❌ Taken down by hosting providers
- ❌ Censored by governments
- ❌ Controlled by centralized companies

### The Solution ✅

VaultLink uses:
- ✅ **PinMe deployment** - Tamper-proof frontend on IPFS
- ✅ **On-chain verification** - Content hash proves authenticity
- ✅ **End-to-end encryption** - AES-256, keys never leave your browser
- ✅ **Decentralized storage** - Encrypted vaults on IPFS

---

## 🚀 Live Demo

**Try it now:** https://iggepe6m.pinit.eth.limo

**Watch demo:** [YouTube Video](YOUR_YOUTUBE_LINK_HERE)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Secure** | AES-256 encryption, master password never transmitted |
| 🌐 **Decentralized** | No servers, hosted on IPFS via PinMe |
| ✅ **Verified** | Green badge confirms authentic interface |
| 🔑 **Password Generator** | Create strong passwords with custom rules |
| 🔍 **Search & Filter** | Find passwords by name or category |
| ⏰ **Auto-Lock** | Locks after 15 minutes of inactivity |
| 📋 **Clipboard** | Copy passwords, auto-clear after 30 seconds |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 🎥 Demo Video

[![VaultLink Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](YOUR_YOUTUBE_LINK_HERE)

*Click to watch the full demo*

---

## 🏗️ How It Works

  1. Connect wallet
  2. Encrypt passwords locally
  3. Upload encrypted vault
  4. Get IPFS hash (CID)
  5. Store CID on-chain
  6. Verify frontend hash


**Your master password never leaves your browser!**

---

## 📜 Smart Contracts

Deployed on **Base Sepolia** testnet

| Contract | Address | Purpose |
|----------|---------|---------|
| **VaultRegistry** | [`0x1adA881B3Fc06972Cb16A61DE6166fb2242B1cBd`](https://sepolia.basescan.org/address/0x1adA881B3Fc06972Cb16A61DE6166fb2242B1cBd) | Stores encrypted vault locations |
| **FrontendRegistry** | [`0x99a18f6A5d384711D41DA514b9DB1A00EF765e00`](https://sepolia.basescan.org/address/0x99a18f6A5d384711D41DA514b9DB1A00EF765e00) | Verifies frontend authenticity |

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- RainbowKit (wallet connection)
- ethers.js (Web3)
- crypto-js (encryption)

**Smart Contracts**
- Solidity ^0.8.20
- Hardhat
- Base Sepolia L2

**Infrastructure**
- PinMe (IPFS deployment)
- Pinata (IPFS pinning)
- IPFS (storage)

---

## 💻 Local Development

### Prerequisites
- Node.js >= 16
- MetaMask wallet
- Base Sepolia ETH ([get from faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

```bash
# Clone repository
git clone https://github.com/Agihtaws/Vault.git
cd Vault

# Install smart contract dependencies
cd smart_contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

Environment Setup
Create smart_contracts/.env:
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

Create frontend/.env:
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

Run Locally
# Start frontend
cd frontend
npm run dev

# Visit http://localhost:3000

Deploy Contracts
cd smart_contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 🔒 Security

- ✅ 73 passing tests - Full test coverage
- ✅ Client-side encryption - AES-256 algorithm
- ✅ No backend - Can't be hacked if it doesn't exist
- ✅ Open source - Auditable by anyone
- ✅ Content verification - On-chain hash proves authenticity


## 🎯 PinMe Integration
VaultLink demonstrates why decentralized frontends matter:
### Traditional Hosting
- ❌ Attacker modifies frontend code
- ❌ Users enter master password
- ❌ Attacker steals all passwords

### PinMe Deployment
- ✅ Frontend on IPFS (immutable)
- ✅ Content hash verified on-chain
- ✅ Green badge confirms authenticity
- ✅ Attack prevented!


## 🏆 Built For
- PinMe DeFront Hack 2025
- Proving that decentralized frontends make your site safer

### 👤 Author
Swathiga Ganesh

#### GitHub: @Agihtaws
#### Email: swathiga581@gmail.com


## 📄 License
MIT License - see LICENSE
