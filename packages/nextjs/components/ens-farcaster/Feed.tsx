"use client";

import { useEffect, useState, useCallback } from "react";
import { CastCard } from "./CastCard";
import { useAccount, useEnsName, usePublicClient } from "wagmi";
import { namehash, parseAbiItem } from "viem";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const Feed = () => {
  const { address } = useAccount();
  // Read ENS name from SEPOLIA
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    if (!publicClient) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    console.log("🚀 Fetching casts from ENS text records...");

    try {
      const allCasts: any[] = [];

      // 1. Fetch current user's casts from their ENS name
      if (ensName) {
        try {
          const node = namehash(ensName);
          console.log(`📡 Reading casts from ${ensName}...`);

          const castsJson = await publicClient.readContract({
            address: SEPOLIA_RESOLVER,
            abi: PUBLIC_RESOLVER_ABI,
            functionName: "text",
            args: [node, "social.casts"],
          }) as string;

          if (castsJson) {
            const parsed = JSON.parse(castsJson);
            allCasts.push(...parsed);
            console.log(`✨ Found ${parsed.length} casts from ${ensName}`);
          }
        } catch {
          console.warn("No casts found for current user");
        }
      }

      // 2. Discover other users via TextChanged events (limited to recent blocks)
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 500n; // Last ~10 minutes

        console.log(`📡 Discovering other casters from blocks ${fromBlock} to ${currentBlock}...`);

        const logs = await publicClient.getLogs({
          address: SEPOLIA_RESOLVER,
          event: parseAbiItem("event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)"),
          fromBlock,
        });

        // Filter for social.casts text records
        const castNodes = logs
          .filter(log => log.args.key === "social.casts")
          .map(log => log.args.node)
          .filter(Boolean) as string[];

        const uniqueNodes = Array.from(new Set(castNodes));
        console.log(`🔍 Found ${uniqueNodes.length} unique casters in recent blocks`);

        // Fetch casts from discovered nodes
        for (const node of uniqueNodes.slice(0, 10)) { // Limit to 10 for performance
          try {
            const castsJson = await publicClient.readContract({
              address: SEPOLIA_RESOLVER,
              abi: PUBLIC_RESOLVER_ABI,
              functionName: "text",
              args: [node, "social.casts"],
            }) as string;

            if (castsJson) {
              const parsed = JSON.parse(castsJson);
              allCasts.push(...parsed);
            }
          } catch {
            // Skip failed reads
          }
        }
      } catch (e) {
        console.warn("Event discovery failed, using only user's casts");
      }

      // Deduplicate and sort by timestamp
      const uniqueCasts = allCasts.filter((cast, index, self) =>
        index === self.findIndex(c => c.id === cast.id)
      );
      const sortedFeed = uniqueCasts.sort((a, b) => b.timestamp - a.timestamp);

      console.log(`✨ Total feed: ${sortedFeed.length} casts`);
      setFeed(sortedFeed);

    } catch (e) {
      console.error("Error fetching feed:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [publicClient, ensName]);

  useEffect(() => {
    fetchFeed();

    // Listen for new casts
    const handleNewCast = () => {
      console.log("🔄 New cast detected, refreshing...");
      setTimeout(() => fetchFeed(true), 2000); // Wait for tx confirmation
    };

    window.addEventListener("cast-success", handleNewCast);
    return () => window.removeEventListener("cast-success", handleNewCast);
  }, [fetchFeed]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-base-100/50 h-32 rounded-3xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-px bg-base-300 border border-base-300 rounded-[2rem] overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center px-6 py-4 bg-base-100/80 border-b border-base-300">
        <h2 className="font-black text-lg">
          Global Feed
          <span className="ml-2 badge badge-primary badge-sm">On-Chain</span>
        </h2>
        <button
          className={`btn btn-ghost btn-sm rounded-xl ${refreshing ? "loading" : ""}`}
          onClick={() => fetchFeed(true)}
          disabled={refreshing}
        >
          {!refreshing && "🔄"} Refresh
        </button>
      </div>

      {feed.length === 0 ? (
        <div className="text-center p-16 bg-base-100/80">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-black mb-2">No casts yet!</p>
          <p className="opacity-50">Be the first to post a cast on-chain.</p>
          {!ensName && (
            <p className="mt-4 text-warning">
              Connect a wallet with a Sepolia ENS name to get started
            </p>
          )}
        </div>
      ) : (
        feed.map((cast: any) => <CastCard key={cast.id} cast={cast} />)
      )}

      <div className="px-6 py-3 bg-base-200/50 text-center text-xs opacity-50">
        ⛓️ Powered by ENS Text Records • {feed.length} on-chain casts
      </div>
    </div>
  );
};
