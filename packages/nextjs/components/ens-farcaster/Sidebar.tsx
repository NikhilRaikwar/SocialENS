"use client";

import Image from "next/image";
import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import { useAccount, useEnsName, useEnsText } from "wagmi";

export const Sidebar = () => {
  const { address } = useAccount();
  // Read ENS data from SEPOLIA (where user registered)
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  // Note: Not using useEnsAvatar as it causes CORS issues on Sepolia
  const { data: bio } = useEnsText({ name: ensName || "", key: "description", chainId: 11155111 });
  const { data: followingJson } = useEnsText({ name: ensName || "", key: "social.following", chainId: 11155111 });

  const followingCount = JSON.parse(followingJson || "[]").length;

  // Use avatar from Vercel or logo.png as fallback
  const avatarUrl = `https://avatar.vercel.sh/${ensName || address}`;

  return (
    <div className="flex flex-col gap-6 sticky top-20">
      <div className="bg-base-100 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-base-300 hover:border-primary/30 transition-all group">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
            <img
              src={avatarUrl}
              alt="avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-4 border-base-100 shadow-2xl relative z-10 object-cover"
            />
          </div>
          <div className="w-full max-w-[180px]">
            <h2
              className="font-black text-xl leading-tight mb-1 text-center truncate"
              title={ensName || "Anonymous"}
            >
              {ensName || "Anonymous"}
            </h2>
            <div className="flex justify-center">
              <div className="badge badge-ghost font-mono text-[10px] opacity-50 px-2 py-2 rounded-full">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {bio && (
          <p className="mb-4 text-sm text-base-content/70 italic text-center px-2 line-clamp-2">
            &quot;{bio}&quot;
          </p>
        )}

        <div className="flex justify-center gap-6 border-t border-base-300 pt-4">
          <div className="text-center">
            <span className="font-black text-lg block">{followingCount}</span>
            <span className="text-base-content/50 text-xs">Following</span>
          </div>
          <div className="text-center">
            <span className="font-black text-lg block">0</span>
            <span className="text-base-content/50 text-xs">Followers</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 bg-base-100 p-4 rounded-2xl shadow-lg border border-base-300">
        <Link href="/" className="btn btn-ghost justify-start gap-3 rounded-xl text-base hover:bg-primary/10 hover:text-primary transition-all">
          <span>🏠</span> Home
        </Link>
        <Link href="/profile" className="btn btn-ghost justify-start gap-3 rounded-xl text-base hover:bg-primary/10 hover:text-primary transition-all">
          <span>👤</span> Profile Settings
        </Link>
        <Link
          href={ensName ? `/${ensName.replace(".eth", "")}` : "/#"}
          className="btn btn-ghost justify-start gap-3 rounded-xl text-base hover:bg-primary/10 hover:text-primary transition-all"
        >
          <span>📝</span> My Posts
        </Link>
      </nav>
    </div>
  );
};
