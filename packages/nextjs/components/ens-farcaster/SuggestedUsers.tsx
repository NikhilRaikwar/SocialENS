"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FollowButton } from "./FollowButton";
import { namehash, parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const SuggestedUsers = () => {
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const discoverUsers = async () => {
      if (!publicClient) return;
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const TOTAL_RANGE = 20000n;
        const CHUNK_SIZE = 1000n;
        const startBlock = currentBlock - TOTAL_RANGE > 0n ? currentBlock - TOTAL_RANGE : 0n;

        const foundNodes = new Set<string>();
        let currentTo = currentBlock;

        while (currentTo > startBlock && foundNodes.size < 15) {
          const currentFrom = currentTo - CHUNK_SIZE > startBlock ? currentTo - CHUNK_SIZE : startBlock;
          try {
            const logs = await publicClient.getLogs({
              address: SEPOLIA_RESOLVER,
              event: parseAbiItem(
                "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
              ),
              fromBlock: currentFrom,
              toBlock: currentTo,
            });

            logs.forEach(log => {
              if (log.args.key === "social.casts" && log.args.node) {
                foundNodes.add(log.args.node);
              }
            });
          } catch (e) {
            // Skip failed chunks
          }
          currentTo = currentFrom - 1n;
        }

        const nodeList = Array.from(foundNodes);
        const names = await Promise.all(
          nodeList.map(async node => {
            try {
              const json = (await publicClient.readContract({
                address: SEPOLIA_RESOLVER,
                abi: PUBLIC_RESOLVER_ABI,
                functionName: "text",
                args: [node, "social.casts"],
              })) as string;
              const parsed = JSON.parse(json || "[]");
              return parsed[0]?.author;
            } catch {
              return null;
            }
          }),
        );

        setUsers(Array.from(new Set(names.filter(Boolean) as string[])));
      } catch (e) {
        console.error("Discovery error:", e);
      } finally {
        setLoading(false);
      }
    };

    discoverUsers();
  }, [publicClient]);

  if (loading)
    return (
      <div className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-32 bg-base-300 rounded mb-2"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-base-300"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-base-300 rounded w-3/4"></div>
              <div className="h-2 bg-base-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );

  if (users.length === 0)
    return (
      <div className="glass-panel p-6 rounded-[2rem] border border-white/5 text-center opacity-40">
        <p className="text-sm italic">Scanning the chain for users...</p>
      </div>
    );

  return (
    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 flex flex-col gap-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>

      <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-3 relative z-10">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        New Joiners & Active
      </h3>

      <div className="flex flex-col gap-5 relative z-10">
        {users.map(name => (
          <div
            key={name}
            className="flex items-center justify-between gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all group/user"
          >
            <Link href={`/${name.replace(".eth", "")}`} className="flex items-center gap-3 min-w-0 flex-grow">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0 shadow-lg group-hover/user:scale-110 transition-transform duration-300 ring-2 ring-transparent group-hover/user:ring-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://avatar.vercel.sh/${name}`} alt={name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black truncate group-hover/user:text-primary transition-colors">
                  {name}
                </span>
                <span className="text-[9px] opacity-30 uppercase tracking-widest font-mono">Verified On-Chain</span>
              </div>
            </Link>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <FollowButton targetName={name} size="xs" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-4 border-t border-white/5 text-center">
        <p className="text-[9px] opacity-20 uppercase tracking-[0.2em] font-medium">Updated live from Sepolia</p>
      </div>
    </div>
  );
};
