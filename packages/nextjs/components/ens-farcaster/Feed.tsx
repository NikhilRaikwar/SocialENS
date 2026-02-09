"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CastCard } from "./CastCard";
import { namehash, parseAbiItem } from "viem";
import { useAccount, useEnsName, usePublicClient } from "wagmi";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const Feed = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastBlockScanned, setLastBlockScanned] = useState<bigint>(0n);

  const fetchFeed = useCallback(
    async (isRefresh = false, loadMore = false) => {
      if (!publicClient) return;

      if (isRefresh) setRefreshing(true);
      else if (loadMore) setLoadingMore(true);
      else setLoading(true);

      console.log("🚀 Fetching casts from ENS text records...", { isRefresh, loadMore });

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const BLOCK_RANGE = 2500n; // Increased to 2500n to widen discovery window while staying within reasonable limits

        let fromBlock: bigint;
        let toBlock: bigint;

        if (loadMore && lastBlockScanned > 0n) {
          // Scan backwards from where we left off
          toBlock = lastBlockScanned - 1n;
          fromBlock = toBlock - BLOCK_RANGE;
        } else {
          // Fresh loading or Refresh: scan latest
          toBlock = currentBlock;
          fromBlock = currentBlock - BLOCK_RANGE;
        }

        if (fromBlock < 0n) fromBlock = 0n;

        // Fetch logs for discovery
        const logs = await publicClient.getLogs({
          address: SEPOLIA_RESOLVER,
          event: parseAbiItem(
            "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
          ),
          fromBlock,
          toBlock,
        });

        const castNodes = logs
          .filter(log => log.args.key === "social.casts")
          .map(log => log.args.node)
          .filter(Boolean) as string[];

        const uniqueNodes = Array.from(new Set(castNodes));
        const newCasts: any[] = [];

        // Also check current user if it's the first load
        if (!loadMore && ensName) {
          try {
            const node = namehash(ensName);
            if (!uniqueNodes.includes(node)) uniqueNodes.push(node);
          } catch { }
        }

        // Fetch actual text records
        for (const node of uniqueNodes) {
          try {
            const castsJson = (await publicClient.readContract({
              address: SEPOLIA_RESOLVER,
              abi: PUBLIC_RESOLVER_ABI,
              functionName: "text",
              args: [node, "social.casts"],
            })) as string;

            if (castsJson) {
              const parsed = JSON.parse(castsJson);
              // Ensure parsed casts have an ID and author
              const validCasts = parsed.map((c: any) => ({
                ...c,
                // If the cast object itself doesn't have an author field, we can try to infer it,
                // but usually the Compose logic puts it there. 
                // We should filter out malformed ones if needed.
              }));
              newCasts.push(...validCasts);
            }
          } catch {
            // Skip failed reads
          }
        }

        setFeed(prev => {
          const combined = loadMore ? [...prev, ...newCasts] : newCasts;
          // Deduplicate by ID
          const unique = combined.filter((cast, index, self) =>
            index === self.findIndex(c => c.id === cast.id)
          );
          // Sort by timestamp descending
          return unique.sort((a, b) => b.timestamp - a.timestamp);
        });

        setLastBlockScanned(fromBlock);

      } catch (e) {
        console.error("Error fetching feed:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [publicClient, ensName, lastBlockScanned],
  );

  useEffect(() => {
    fetchFeed();
    const handleNewCast = () => {
      setTimeout(() => fetchFeed(true), 2000);
    };
    window.addEventListener("cast-success", handleNewCast);
    return () => window.removeEventListener("cast-success", handleNewCast);
  }, [fetchFeed]);



  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel h-40 rounded-[2rem] animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          Global Feed
          <span className="badge badge-primary badge-outline font-mono text-xs py-3">LIVE</span>
        </h2>
        <button
          className={`btn btn-ghost btn-sm rounded-full hover:bg-white/10 ${refreshing ? "loading" : ""}`}
          onClick={() => fetchFeed(true, false)}
          disabled={refreshing}
        >
          {!refreshing && "⚡ Refresh"}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {feed.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-[2.5rem] border-dashed border-2 border-base-content/10">
            <div className="text-7xl mb-6 opacity-80 mix-blend-luminosity">📭</div>
            <h3 className="text-2xl font-black mb-2">Silence on the chain...</h3>
            <p className="opacity-50 max-w-xs mx-auto mb-8">
              Be the first to cast your thoughts to the eternal ledger.
            </p>
            {!ensName && <div className="badge badge-warning p-4 gap-2">⚠️ Connect ENS Wallet to Post</div>}
          </div>
        ) : (
          feed.map((cast: any) => <CastCard key={cast.id} cast={cast} />)
        )}
      </div>

      <div className="text-center py-8">
        <button
          className="btn btn-outline btn-wide rounded-full hover:bg-white/5 transition-all active:scale-95"
          onClick={() => fetchFeed(false, true)}
          disabled={loadingMore || loading}
        >
          {loadingMore ? "Scanning Chain History..." : "Load Older Casts"}
        </button>
        <div className="mt-4 opacity-30 text-xs font-mono tracking-widest uppercase">
          Scanning 2,500 Blocks/Click • Last: {lastBlockScanned.toString()}
        </div>
      </div>
    </div>
  );
};
