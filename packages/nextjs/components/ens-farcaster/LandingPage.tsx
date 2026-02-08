"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";

export const LandingPage = ({ hasNoEns }: { hasNoEns?: boolean }) => {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans selection:bg-primary selection:text-black relative overflow-hidden">

      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] opacity-30 animate-float"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/10 text-xs font-bold tracking-widest uppercase mb-8 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live on Sepolia Testnet
            </div>

            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8">
              SOCIAL<br />
              <span className="text-gradient">ENS</span>
            </h1>

            <p className="text-xl md:text-2xl opacity-70 mb-12 font-light leading-relaxed max-w-xl">
              The first truly sovereign social network. No servers. No databases.
              <br />
              <span className="text-primary font-medium">Just you and your ENS name.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              {!hasNoEns ? (
                <button
                  onClick={openConnectModal}
                  className="btn btn-primary btn-lg rounded-full px-10 text-lg shadow-neon hover:scale-105 transition-transform border-none text-black font-black"
                >
                  Connect Identity
                </button>
              ) : (
                <a
                  href="https://sepolia.app.ens.domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-error btn-lg rounded-full px-10 text-lg shadow-neon hover:scale-105 transition-transform font-bold"
                >
                  Get Sepolia ENS
                </a>
              )}
              <a
                href="#features"
                className="btn btn-ghost btn-lg rounded-full px-10 text-lg hover:bg-white/5 border border-white/10"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Abstract Graphic / Data Visualization Placeholder */}
          <div className="lg:w-1/2 relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-[80px] opacity-20 animate-pulse-slow"></div>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 rotate-3 hover:rotate-0 transition-all duration-700">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                  <div className="w-16 h-16 rounded-full bg-base-300 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-base-300 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-base-300/50 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-3 w-full bg-base-300/30 rounded animate-pulse"></div>
                  <div className="h-3 w-[90%] bg-base-300/30 rounded animate-pulse"></div>
                  <div className="h-3 w-[60%] bg-base-300/30 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-primary/20 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -bottom-10 -left-10 glass-panel p-5 rounded-3xl border border-white/10 -rotate-6 hover:rotate-0 transition-all duration-500 animate-float" style={{ animationDelay: '1s' }}>
                <span className="text-4xl">⛓️</span>
              </div>
              <div className="absolute -top-5 -right-5 glass-panel p-5 rounded-3xl border border-white/10 rotate-12 hover:rotate-0 transition-all duration-500 animate-float" style={{ animationDelay: '2s' }}>
                <span className="text-4xl">🌐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="mt-40">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            Decentralized <span className="text-gradient">By Design</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Unstoppable Identity", desc: "Your social profile IS your ENS name. Completely portable.", icon: "💎" },
              { title: "Zero Database", desc: "Every post is a text record on Ethereum. No centralized servers.", icon: "⚡" },
              { title: "Censorship Resistant", desc: "No one can ban you or delete your content. You own the keys.", icon: "🛡️" },
            ].map((f, i) => (
              <div key={i} className="glass-panel p-8 rounded-[2rem] hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 border border-white/5">
                <div className="text-5xl mb-6">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="opacity-60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
