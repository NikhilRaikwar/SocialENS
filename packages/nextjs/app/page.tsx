"use client";

import type { NextPage } from "next";
import { Compose } from "~~/components/ens-farcaster/Compose";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { Feed } from "~~/components/ens-farcaster/Feed";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";
import { SuggestedUsers } from "~~/components/ens-farcaster/SuggestedUsers";

const Home: NextPage = () => {
  return (
    <EnsGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <Sidebar />
          </div>

          {/* Main Feed */}
          <div className="col-span-1 md:col-span-8 lg:col-span-6">
            <div className="flex flex-col gap-6">
              <Compose />
              <Feed />
            </div>
          </div>

          {/* Right Sidebar - Dynamic User Discovery */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="flex flex-col gap-6 sticky top-24">
              <SuggestedUsers />

              <div className="glass-panel p-6 rounded-[1.5rem] border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-relaxed">
                  Powered by ENS & Sepolia. <br /> 100% On-Chain Social.
                </p>
                <div className="mt-2 h-1 w-8 bg-primary/30 rounded-full"></div>
                <p className="mt-4 text-[9px] opacity-30 leading-tight">
                  No databases. No servers. <br /> Sovereign data stored in your .eth name.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnsGuard>
  );
};

export default Home;
