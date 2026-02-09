"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useEnsAvatar, useEnsName, useEnsText } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { SuggestedUsers } from "./SuggestedUsers";
import { FollowListModal } from "./FollowListModal";

export const Sidebar = () => {
  const { address } = useAccount();
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const { data: bio } = useEnsText({ name: ensName || undefined, key: "description", chainId: 11155111 });
  const { data: followingJson } = useEnsText({ name: ensName || undefined, key: "social.following", chainId: 11155111 });
  const { data: followersJson } = useEnsText({ name: ensName || undefined, key: "social.followers", chainId: 11155111 });

  const followingCount = JSON.parse(followingJson || "[]").length;
  const followersCount = JSON.parse(followersJson || "[]").length;
  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined, chainId: 11155111 });
  const avatarUrl = ensAvatar || `https://avatar.vercel.sh/${ensName || address}`;

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      {/* Profile Card */}
      <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative group overflow-hidden transition-all hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-500"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-24 h-24 rounded-full border-2 border-white/20 shadow-2xl relative z-10 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-3">
              <h2 className="font-bold text-xl truncate text-primary/90" title={ensName || "Anonymous"}>
                {ensName || "Anonymous"}
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address || "");
                  notification.success("Address copied");
                }}
                className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10 transition-all opacity-50 hover:opacity-100"
                title="Copy Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                </svg>
              </button>
            </div>

            {bio && (
              <p className="text-sm opacity-70 italic line-clamp-2 px-2 mb-4 leading-relaxed font-light">
                {bio}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
              <div
                className="text-center p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => setModalType("following")}
              >
                <span className="font-black text-lg block group-hover:text-primary transition-colors">{followingCount}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Following</span>
              </div>
              <div
                className="text-center p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => setModalType("followers")}
              >
                <span className="font-black text-lg block group-hover:text-primary transition-colors">{followersCount}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={modalType === "followers" ? "Followers" : "Following"}
        names={modalType === "followers" ? (followersJson ? JSON.parse(followersJson) : []) : (followingJson ? JSON.parse(followingJson) : [])}
      />

      {/* Navigation */}
      <nav className="glass-panel p-3 rounded-[1.5rem] border border-white/5 flex flex-col gap-1">
        {[
          { icon: "🏠", label: "Home", href: "/" },
          { icon: "👤", label: "Profile", href: "/profile" },
          { icon: "📝", label: "My Posts", href: ensName ? `/${ensName.replace(".eth", "")}` : "/#" },
        ].map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="btn btn-ghost justify-start gap-4 rounded-xl h-12 text-lg hover:bg-white/5 hover:pl-6 transition-all duration-300 group"
          >
            <span className="group-hover:scale-125 transition-transform duration-300">{link.icon}</span>
            <span className="font-medium opacity-70 group-hover:opacity-100 group-hover:text-primary transition-colors">
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="text-center text-[10px] opacity-20 font-mono tracking-widest hover:opacity-100 transition-opacity cursor-default">
        SOCIALENS v1.0 • SEPOLIA
      </div>
    </div>
  );
};
