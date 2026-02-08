# 🌐 SocialENS

<div align="center">

![SocialENS Banner](https://img.shields.io/badge/Social-ENS-blue?style=for-the-badge&logo=ethereum)

**The First Fully Decentralized Social Network Powered by ENS Text Records**

[![Built with Scaffold-ETH 2](https://img.shields.io/badge/Built%20with-Scaffold--ETH%202-blueviolet?style=flat-square)](https://scaffoldeth.io/)
[![ENS Integration](https://img.shields.io/badge/ENS-Integrated-3498db?style=flat-square&logo=ethereum)](https://ens.domains/)
[![Ethereum Sepolia](https://img.shields.io/badge/Network-Sepolia-yellow?style=flat-square)](https://sepolia.etherscan.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#-quick-start) • [Video Demo](#-demo) • [Documentation](#-how-it-works) • [Roadmap](#-roadmap)

</div>

---

## 🏆 ETH HACK MONEY 2026 Submission

This project is submitted for the **ENS Integration Prize** at ETH HACK MONEY 2026.

### Prize Categories
- 🎉 **Integrate ENS** - $3,500 (Split among qualifying projects)
- 🥇 **Most Creative Use of ENS for DeFi** - $1,500

---

## ✨ What is SocialENS?

SocialENS is a **100% on-chain social network** where all social data is stored directly in ENS text records. No databases, no backends, just pure blockchain-native social networking.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   👤 User connects wallet with Sepolia ENS name                │
│                           │                                     │
│                           ▼                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │         SocialENS App               │                  │
│   │   • Read ENS name (useEnsName)          │                  │
│   │   • Read text records (useEnsText)      │                  │
│   │   • Write casts (setText)               │                  │
│   └─────────────────────────────────────────┘                  │
│                           │                                     │
│                           ▼                                     │
│   ┌─────────────────────────────────────────┐                  │
│   │     ENS Public Resolver (Sepolia)       │                  │
│   │   0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5              │
│   │                                          │                  │
│   │   Text Records:                          │                  │
│   │   • social.casts → JSON array of posts  │                  │
│   │   • social.following → JSON array       │                  │
│   │   • description → Profile bio           │                  │
│   └─────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

| Feature | Description | ENS Integration |
|---------|-------------|-----------------|
| 🔐 **ENS-Gated Access** | Only users with Sepolia ENS names can access the app | `useEnsName` hook |
| 📝 **On-Chain Casts** | Posts stored in ENS text records | `setText("social.casts", ...)` |
| 👥 **On-Chain Following** | Social graph stored in ENS | `setText("social.following", ...)` |
| 👤 **Portable Profiles** | Profile data in ENS text records | `description`, `avatar` records |
| 💰 **Native Tipping** | Tip creators via ENS addresses | `useEnsAddress` for payments |
| 📡 **Feed Discovery** | Uses `TextChanged` events | `getLogs` with event filtering |

---

## 🛠️ Technology Stack

```
Frontend:        Next.js 14 + TypeScript + TailwindCSS
Blockchain:      Ethereum Sepolia Testnet
Identity:        ENS (Ethereum Name Service)
Wallet:          RainbowKit + wagmi v2
Framework:       Scaffold-ETH 2
Data Storage:    ENS Text Records (100% on-chain)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- MetaMask or any Web3 wallet
- Sepolia ENS name ([Register here](https://sepolia.app.ens.domains))
- Sepolia testnet ETH ([Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ens-farcaster.git
cd ens-farcaster

# Install dependencies
yarn install

# Copy environment template
cp packages/nextjs/.env.example packages/nextjs/.env.local

# Add your RPC URL to .env.local
# NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Start the development server
yarn start
```

### Environment Variables

Create `packages/nextjs/.env.local`:

```env
# Required: Sepolia RPC URL
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Optional: Alchemy API Key (backup RPC)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

---

## 📖 How It Works

### ENS Text Records Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    yourname.eth (Sepolia)                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Text Record: "social.casts"                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [                                                       │ │
│  │   {                                                     │ │
│  │     "id": 1707584400000,                               │ │
│  │     "text": "GM! My first on-chain cast 🌐",           │ │
│  │     "timestamp": 1707584400000,                        │ │
│  │     "author": "yourname.eth",                          │ │
│  │     "authorAddress": "0x..."                           │ │
│  │   },                                                    │ │
│  │   ...                                                   │ │
│  │ ]                                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Text Record: "social.following"                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ["vitalik.eth", "nick.eth", "brantly.eth"]             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Text Record: "description"                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ "Web3 builder | ENS enthusiast | Building the future"  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Code Examples

#### Reading ENS Name (Identity Verification)
```typescript
import { useEnsName } from "wagmi";

const { data: ensName } = useEnsName({ 
  address, 
  chainId: 11155111 // Sepolia
});
```

#### Writing Casts to ENS Text Records
```typescript
import { namehash } from "viem";
import { useWriteContract } from "wagmi";

const node = namehash(ensName);
await writeContractAsync({
  address: SEPOLIA_RESOLVER,
  abi: PUBLIC_RESOLVER_ABI,
  functionName: "setText",
  args: [node, "social.casts", JSON.stringify(updatedCasts)],
});
```

#### Discovering Other Users (Event-Based)
```typescript
const logs = await publicClient.getLogs({
  address: SEPOLIA_RESOLVER,
  event: parseAbiItem(
    "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)"
  ),
  fromBlock: currentBlock - 500n,
});
```

---

## 📊 Smart Contract Addresses

| Contract | Network | Address |
|----------|---------|---------|
| ENS Public Resolver | Sepolia | `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5` |

---

## 🗺️ Roadmap

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Phase 1: Genesis (Current)                                     │
│  ├─ ✅ ENS-gated access                                         │
│  ├─ ✅ On-chain casts via text records                          │
│  ├─ ✅ Decentralized feed discovery                             │
│  └─ ✅ Portable ENS profiles                                    │
│                                                                  │
│  Phase 2: Social DeFi (Q2 2025)                                 │
│  ├─ 🔜 Native ETH tipping                                       │
│  ├─ 🔜 Token-gated premium content                              │
│  ├─ 🔜 NFT profile badges                                       │
│  └─ 🔜 Creator monetization via ENS subnames                    │
│                                                                  │
│  Phase 3: Multi-Chain Identity (Q3 2025)                        │
│  ├─ 🔮 CCIP-Read cross-chain resolution                         │
│  ├─ 🔮 L2 subname support (Optimism, Base, Arbitrum)           │
│  └─ 🔮 Gasless posting via account abstraction                  │
│                                                                  │
│  Phase 4: Decentralized Governance (Q4 2025)                    │
│  ├─ 🔮 DAO-controlled content policies                          │
│  ├─ 🔮 Community moderation tokens                              │
│  └─ 🔮 Open plugin architecture                                 │
│                                                                  │
│  Phase 5: Global Scale (2026)                                   │
│  ├─ 🔮 ENS Namechain integration                                │
│  ├─ 🔮 AI-powered content discovery                             │
│  ├─ 🔮 Verified identity badges (Dentity)                       │
│  └─ 🔮 Interop with Lens, Farcaster, Bluesky                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ens-farcaster/
├── packages/
│   └── nextjs/
│       ├── app/
│       │   ├── page.tsx              # Main app entry
│       │   ├── profile/page.tsx      # User profile settings
│       │   └── [name]/page.tsx       # Dynamic user profiles
│       ├── components/
│       │   └── ens-farcaster/
│       │       ├── Compose.tsx       # Cast composition (ENS write)
│       │       ├── Feed.tsx          # Feed display (ENS read)
│       │       ├── CastCard.tsx      # Individual cast display
│       │       ├── Sidebar.tsx       # User sidebar
│       │       ├── FollowButton.tsx  # Follow functionality
│       │       ├── EnsGuard.tsx      # ENS gating logic
│       │       └── LandingPage.tsx   # Landing page
│       ├── utils/
│       │   └── ens.ts                # ENS resolver ABI
│       └── scaffold.config.ts        # Network configuration
└── README.md
```

---

## 🎬 Demo

### Video Demo
[📹 Watch the Demo Video](YOUR_YOUTUBE_LINK)

### Live Demo
[🌐 Try the Live App](YOUR_VERCEL_LINK)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [ENS Domains](https://ens.domains/) - For the incredible naming infrastructure
- [Scaffold-ETH 2](https://scaffoldeth.io/) - For the amazing development framework
- [Farcaster](https://farcaster.xyz/) - For inspiring the UI/UX
- [ETHGlobal HackMoney 2026](https://ethglobal.com/events/hackmoney2026) - For hosting amazing hackathons

---

<div align="center">

**Built with ❤️ for ETH HACK MONEY 2026**

[![ENS](https://img.shields.io/badge/ENS-Domains-blue?style=for-the-badge)](https://ens.domains/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)

</div>
