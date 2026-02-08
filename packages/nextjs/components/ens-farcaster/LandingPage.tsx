"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";

export const LandingPage = ({ hasNoEns }: { hasNoEns?: boolean }) => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="min-h-screen bg-base-100 text-base-content relative overflow-hidden flex flex-col">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-float"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-32 flex-grow">
        {/* Hero Section - Balanced and Professional */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold tracking-widest uppercase mb-8 text-primary shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            100% On-Chain Social Protocol
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            Social<span className="text-primary tracking-tighter">ENS</span>
          </h1>

          <p className="text-xl md:text-2xl opacity-70 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Own your social graph. Powered by the Ethereum Name Service. Stored eternally in text records, accessible to
            everyone, controlled by no one.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!hasNoEns ? (
              <button
                onClick={openConnectModal}
                className="btn btn-primary btn-lg rounded-full px-12 text-lg shadow-xl hover:scale-105 transition-all font-bold"
              >
                Connect Identity
              </button>
            ) : (
              <a
                href="https://sepolia.app.ens.domains"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-error btn-lg rounded-full px-12 text-lg shadow-xl hover:scale-105 transition-all font-bold"
              >
                Get Sepolia ENS
              </a>
            )}
            <a
              href="https://sepolia.app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg rounded-full px-12 text-lg border-white/10 hover:bg-white/5 transition-all"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section - Restored and Improved */}
        <div id="features" className="max-w-6xl mx-auto mb-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Key Features</h2>
            <div className="h-1.5 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "No DB, No Backend",
                desc: "All social data is stored in ENS text records on Sepolia. Fully censorship resistant.",
                icon: "⛓️",
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                title: "Portable Identity",
                desc: "Your followers and posts follow your .eth name across any supported app.",
                icon: "🕊️",
                color: "bg-purple-500/10 text-purple-500",
              },
              {
                title: "On-Chain Social Graph",
                desc: "Follow lists are stored as JSON text records on the ENS Public Resolver.",
                icon: "📈",
                color: "bg-green-500/10 text-green-500",
              },
              {
                title: "Professional Aesthetic",
                desc: "A clean, responsive interface that feels like a modern social app, running on Web3 rails.",
                icon: "🎨",
                color: "bg-orange-500/10 text-orange-500",
              },
              {
                title: "Tipping & DeFi",
                desc: "Directly tip creators via their ENS names. Social meets programmable money.",
                icon: "💰",
                color: "bg-yellow-500/10 text-yellow-500",
              },
              {
                title: "100% Open Source",
                desc: "Built with Scaffold-ETH 2. Audit the code, fork it, and build on top.",
                icon: "📂",
                color: "bg-teal-500/10 text-teal-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-base-200/50 p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1 group"
              >
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl ${f.color} text-2xl mb-6 shadow-inner`}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="opacity-60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section - Restored */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Common Questions</h2>
          </div>
          <div className="space-y-4">
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
                className="collapse collapse-arrow bg-base-200/50 border border-white/5 rounded-2xl overflow-hidden"
              >
                <input type="radio" name="faq-accordion" />
                <div className="collapse-title text-lg font-bold p-6">{item.q}</div>
                <div className="collapse-content px-6 pb-6 opacity-60">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-12 text-center border-t border-white/5 bg-base-200/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-sm flex flex-col items-center gap-4">
          <p className="opacity-40 font-medium">Built for ETH HACK MONEY 2026 • Powered by Ethereum Sepolia & ENS</p>
          <div className="flex gap-6 opacity-60">
            <span className="hover:text-primary transition-colors cursor-pointer">Documentation</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Github</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
