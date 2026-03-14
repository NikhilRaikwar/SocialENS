"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CastCard } from "./CastCard";
import { namehash, parseAbiItem } from "viem";
import { useAccount, useEnsName, usePublicClient } from "wagmi";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

// ENS Public Resolver on Ethereum Sepolia
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const Feed = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use a ref for last block to avoid infinite loop triggers while still tracking state
  const lastBlockScannedRef = useRef<bigint>(0n);
  const [displayLastBlock, setDisplayLastBlock] = useState<bigint>(0n);

  const fetchFeed = useCallback(
    async (isRefresh = false, loadMore = false) => {
      if (!publicClient) return;

      if (isRefresh) setRefreshing(true);
      else if (loadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const TOTAL_SCAN_RANGE = 20000n; // Reduced range for faster initial feedback
        const CHUNK_SIZE = 1000n; // Safest chunk size to avoid 400 errors across all nodes

        let toBlock: bigint;
        if (loadMore && lastBlockScannedRef.current > 0n) {
          toBlock = lastBlockScannedRef.current - 1n;
        } else {
          toBlock = currentBlock;
        }

        const finalFromBlock = toBlock - TOTAL_SCAN_RANGE > 0n ? toBlock - TOTAL_SCAN_RANGE : 0n;
        const uniqueNodes = new Set<string>();

        // 1. Discovery phase with standard TextChanged signature
        let currentTo = toBlock;
        while (currentTo > finalFromBlock) {
          const currentFrom = currentTo - CHUNK_SIZE > finalFromBlock ? currentTo - CHUNK_SIZE : finalFromBlock;

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
                uniqueNodes.add(log.args.node);
              }
            });
          } catch (e) {
            // Silently skip failed chunks to keep feed alive
          }
          currentTo = currentFrom - 1n;
        }

        const nodesToFetch = Array.from(uniqueNodes);

        // Always include current user's own casts
        if (!loadMore && ensName) {
          try {
            const node = namehash(ensName);
            if (!uniqueNodes.has(node)) nodesToFetch.push(node);
          } catch {}
        }

        const settledCasts: any[] = [];
        const batchSize = 5;
        for (let i = 0; i < nodesToFetch.length; i += batchSize) {
          const batch = nodesToFetch.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async node => {
              try {
                const json = (await publicClient.readContract({
                  address: SEPOLIA_RESOLVER,
                  abi: PUBLIC_RESOLVER_ABI,
                  functionName: "text",
                  args: [node, "social.casts"],
                })) as string;
                return json ? JSON.parse(json) : [];
              } catch {
                return [];
              }
            }),
          );
          results.forEach(casts => settledCasts.push(...casts));
        }

        setFeed(prev => {
          const combined = loadMore ? [...prev, ...settledCasts] : settledCasts;
          const unique = combined.filter((cast, idx, self) => idx === self.findIndex(c => c.id === cast.id));
          return unique.sort((a, b) => b.timestamp - a.timestamp);
        });

        lastBlockScannedRef.current = finalFromBlock;
        setDisplayLastBlock(finalFromBlock);
      } catch (e) {
        console.error("Feed Fetch Error:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [publicClient, ensName],
  );

  useEffect(() => {
    fetchFeed();
    const handleNewCast = () => setTimeout(() => fetchFeed(true), 2500);
    window.addEventListener("cast-success", handleNewCast);
    return () => window.removeEventListener("cast-success", handleNewCast);
  }, [fetchFeed]);

  if (loading)
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel h-48 rounded-[2rem] animate-pulse"></div>
        ))}
      </div>
    );

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
            <div className="text-7xl mb-6 opacity-80">📭</div>
            <h3 className="text-2xl font-black mb-2">Silence on the chain...</h3>
            <p className="opacity-50 max-w-xs mx-auto mb-8">
              Be the first to cast your thoughts to the eternal ledger.
            </p>
          </div>
        ) : (
          feed.map((cast: any) => <CastCard key={cast.id} cast={cast} />)
        )}
      </div>

      <div className="text-center py-8">
        <button
          className="btn btn-outline btn-wide rounded-full hover:bg-white/5 transition-all"
          onClick={() => fetchFeed(false, true)}
          disabled={loadingMore || loading}
        >
          {loadingMore ? "Scanning History..." : "Load Older Casts"}
        </button>
        <div className="mt-4 opacity-30 text-[10px] font-mono tracking-widest uppercase">
          Discovery Depth: 20,000 blocks • Last: {displayLastBlock.toString()}
        </div>
      </div>
    </div>
  );
};
