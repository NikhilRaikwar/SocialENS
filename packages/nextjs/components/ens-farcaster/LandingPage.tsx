"use client";

import Image from "next/image";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export const LandingPage = ({ hasNoEns }: { hasNoEns?: boolean }) => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-100 to-primary/5 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs - more visible */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-4xl w-full text-center z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="SocialENS Logo"
            width={80}
            height={80}
            className="rounded-2xl shadow-2xl"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> 100% On-Chain Social • Ethereum Sepolia
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent leading-tight">
          SocialENS
        </h1>

        <p className="text-lg md:text-xl text-base-content/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          The first fully decentralized social network powered by ENS. Your profile, your follows, and your posts, all
          stored directly in ENS text records on Ethereum Sepolia.
        </p>

        {hasNoEns ? (
          <div className="bg-error/10 border border-error/30 p-8 rounded-3xl max-w-md mx-auto backdrop-blur-sm">
            <div className="text-5xl mb-4">🛂</div>
            <h2 className="text-2xl font-bold text-error mb-2">Sepolia ENS Name Required</h2>
            <p className="mb-6 opacity-80">
              To use SocialENS, you need an ENS name on Sepolia testnet. Register one for free (just gas) to get started!
            </p>
            <a
              href="https://sepolia.app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-error btn-lg rounded-full px-10 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              🌐 Register on Sepolia ENS
            </a>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openConnectModal}
              className="btn btn-primary btn-lg rounded-full px-10 text-lg shadow-2xl hover:scale-105 transition-transform border-0 bg-gradient-to-r from-primary to-secondary"
            >
              🔗 Connect Wallet
            </button>
            <a
              href="https://sepolia.app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg rounded-full px-10 text-lg backdrop-blur-sm hover:bg-base-200"
            >
              Get Sepolia ENS
            </a>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-24 w-full max-w-5xl mx-auto">
          <h2 className="text-3xl font-black mb-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why SocialENS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              {
                title: "No DB, No Backend",
                desc: "All social data is stored in ENS text records on Sepolia. Fully censorship resistant.",
                icon: "⛓️",
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Portable Identity",
                desc: "Your followers and posts follow your .eth name across any supported app.",
                icon: "🕊️",
                color: "from-purple-500 to-pink-500",
              },
              {
                title: "On-Chain Social Graph",
                desc: "Follow lists are stored as JSON text records on the ENS Public Resolver.",
                icon: "📈",
                color: "from-green-500 to-emerald-500",
              },
              {
                title: "Premium Aesthetic",
                desc: "Farcaster-inspired UI that feels like a modern social app, but runs on Ethereum.",
                icon: "🎨",
                color: "from-orange-500 to-amber-500",
              },
              {
                title: "Tipping & DeFi",
                desc: "Directly tip creators via their ENS names. Social meets programmable money.",
                icon: "💰",
                color: "from-yellow-500 to-orange-500",
              },
              {
                title: "100% Open Source",
                desc: "Built with Scaffold-ETH 2. Audit the code, fork it, and build on top.",
                icon: "📂",
                color: "from-teal-500 to-blue-500",
              },
            ].map((feat, i) => (
              <div
                key={i}
                className="group p-6 bg-base-100/80 backdrop-blur-xl rounded-2xl border border-base-300 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`text-3xl mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} bg-opacity-20`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="mt-24 w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-12 text-center">Protocol Roadmap</h2>
          <div className="relative space-y-8">
            {[
              {
                phase: "Phase 1: Genesis",
                status: "Active",
                desc: "ENS-gated access, on-chain casts via text records, decentralized feed discovery using TextChanged events.",
              },
              {
                phase: "Phase 2: Social DeFi",
                status: "Q2 2025",
                desc: "Native ETH tipping via ENS addresses, token-gated casts for premium content, NFT profile badges.",
              },
              {
                phase: "Phase 3: Multi-Chain",
                status: "Q3 2025",
                desc: "CCIP-Read integration for cross-chain ENS resolution, L2 subname support, gasless posting.",
              },
              {
                phase: "Phase 4: Governance",
                status: "Q4 2025",
                desc: "DAO-controlled content policies, community moderation tokens, open plugin architecture.",
              },
              {
                phase: "Phase 5: Global Scale",
                status: "2026",
                desc: "ENS Namechain integration, AI-powered content discovery, interoperability with Lens & Farcaster.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-6 items-start relative pb-8 border-l-2 border-primary/30 ml-3 pl-6 last:border-0 last:pb-0"
              >
                <div className="absolute left-[-9px] w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
                <div className="flex-1 text-left p-6 bg-base-100/80 rounded-2xl border border-base-300 backdrop-blur-sm hover:border-primary/30 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold">{item.phase}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.status === "Active" ? "bg-primary text-primary-content" : "bg-base-300"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-base-content/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 mb-16 w-full max-w-3xl mx-auto">
          <h2 className="text-3xl font-black mb-10">Common Questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "Do I need a mainnet ENS name?",
                a: "For this hackathon demo, you need a Sepolia ENS name. In production, we'd use mainnet ENS with L2 storage for cost efficiency.",
              },
              {
                q: "Is it really 100% decentralized?",
                a: "Yes. There is no database. We read and write everything directly to the ENS Public Resolver contract on Ethereum Sepolia.",
              },
              {
                q: "How much does it cost to post?",
                a: "Since we use Ethereum Sepolia testnet, transactions are essentially free (just need testnet ETH from a faucet).",
              },
              {
                q: "What are text records?",
                a: "Text records are a field in ENS that allows you to store any string data. We use them to store casts, followers, and profile metadata.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="collapse collapse-plus bg-base-100/80 border border-base-300 rounded-2xl text-left overflow-hidden hover:border-primary/30 transition-all"
              >
                <input type="radio" name="my-accordion-3" />
                <div className="collapse-title text-lg font-bold p-5">{item.q}</div>
                <div className="collapse-content px-5 pb-5 opacity-70">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="w-full py-8 text-center text-sm opacity-50 font-medium border-t border-base-300 bg-base-100/50 backdrop-blur-sm">
        Built for ETH HACK MONEY 2026 • Powered by Ethereum Sepolia & ENS Text Records • Scaffold-ETH 2
      </footer>
    </div>
  );
};
