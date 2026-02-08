"use client";

import type { NextPage } from "next";
import { Compose } from "~~/components/ens-farcaster/Compose";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { Feed } from "~~/components/ens-farcaster/Feed";
import { FollowButton } from "~~/components/ens-farcaster/FollowButton";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";

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
              <h1 className="text-3xl font-black mb-2">Home</h1>
              <Compose />
              <Feed />
            </div>
          </div>

          {/* Right Sidebar (Optional - Trending/Suggestions) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-base-100/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-base-300 sticky top-20 hover:border-primary/20 transition-all group">
              <h3 className="font-black text-2xl mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Who to follow
              </h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover/item:scale-110 transition-all">
                      V
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">vitalik.eth</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-40">Builder</p>
                    </div>
                  </div>
                  <FollowButton targetName="vitalik.eth" />
                </div>

                <div className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary font-black text-xl shadow-inner group-hover/item:scale-110 transition-all">
                      S
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">scaffold-eth.eth</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-40">Tooling</p>
                    </div>
                  </div>
                  <FollowButton targetName="scaffold-eth.eth" />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-base-300/50">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-relaxed">
                  Powered by ENS & Base. <br /> 100% On-Chain Social.
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
