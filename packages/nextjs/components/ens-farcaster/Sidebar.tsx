"use client";

import Link from "next/link";
import { useAccount, useEnsAvatar, useEnsName, useEnsText } from "wagmi";

export const Sidebar = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const { data: bio } = useEnsText({ name: ensName || "", key: "description", chainId: 11155111 });
  const { data: followingJson } = useEnsText({ name: ensName || "", key: "social.following", chainId: 11155111 });

  const followingCount = JSON.parse(followingJson || "[]").length;
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
            <h2 className="font-bold text-xl mb-1 truncate text-primary/90" title={ensName || "Anonymous"}>
              {ensName || "Anonymous"}
            </h2>
            <div className="flex justify-center mb-3">
              <span className="text-[10px] font-mono opacity-40 bg-base-300/50 px-3 py-1 rounded-full border border-white/5">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>

            {bio && (
              <p className="text-sm opacity-70 italic line-clamp-2 px-2 mb-4 leading-relaxed font-light">
                &quot;{bio}&quot;
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
              <div className="text-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-black text-lg block">{followingCount}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-40">Following</span>
              </div>
              <div className="text-center p-2 rounded-xl hover:bg-white/5 transition-colors">
                <span className="font-black text-lg block">0</span>
                <span className="text-[10px] uppercase tracking-widest opacity-40">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
