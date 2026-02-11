"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/outline";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const SearchUsers = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [seenUsers, setSeenUsers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const publicClient = usePublicClient({ chainId: 11155111 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initial discovery of users to populate search dropdown with chunked scanning
  useEffect(() => {
    const fetchInitialNames = async () => {
      if (!publicClient) return;
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const TOTAL_SCAN = 20000n;
        const CHUNK_SIZE = 1000n;
        const startBlock = currentBlock - TOTAL_SCAN > 0n ? currentBlock - TOTAL_SCAN : 0n;

        const foundNodes = new Set<string>();
        let currentTo = currentBlock;

        while (currentTo > startBlock && foundNodes.size < 20) {
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

        setSeenUsers(Array.from(new Set(names.filter(Boolean) as string[])));
      } catch (e) {
        console.error("Search discovery error:", e);
      }
    };
    fetchInitialNames();
  }, [publicClient]);

  // Filter suggestions based on input
  useEffect(() => {
    if (search.length > 0) {
      const normalizedSearch = search.toLowerCase();
      const filtered = seenUsers.filter(u => u.toLowerCase().includes(normalizedSearch)).slice(0, 5);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [search, seenUsers]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (name: string) => {
    const normalized = name.toLowerCase().trim().replace(".eth", "");
    router.push(`/${normalized}`);
    setSearch("");
    setIsOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    handleNavigate(search);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-primary transition-all" />
        </div>
        <input
          type="text"
          className="w-full bg-base-100 border-2 border-primary/10 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/40 focus:bg-base-100 transition-all placeholder:opacity-30 shadow-sm"
          placeholder="Search users by .eth..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => search.length > 0 && setIsOpen(true)}
        />
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-white/10 rounded-[1.5rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
          <div className="p-2">
            {suggestions.map(name => (
              <button
                key={name}
                onClick={() => handleNavigate(name)}
                className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 rounded-xl transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://avatar.vercel.sh/${name}`} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black truncate group-hover:text-primary">{name}</span>
                  <span className="text-[10px] opacity-40 uppercase font-mono italic">On-Chain Record</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* "Go to" fallback if no suggestions match exactly */}
      {isOpen &&
        search.length > 2 &&
        !suggestions.includes(
          search.toLowerCase().endsWith(".eth") ? search.toLowerCase() : `${search.toLowerCase()}.eth`,
        ) && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-base-100 border border-white/10 rounded-[1.5rem] shadow-2xl z-[100]">
            <button
              onClick={() => handleNavigate(search)}
              className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 rounded-xl transition-colors text-left"
            >
              <UserIcon className="w-10 h-10 p-2 bg-base-200 rounded-full opacity-50" />
              <div className="flex flex-col">
                <span className="text-sm font-black">Go to "{search.toLowerCase().replace(".eth", "")}.eth"</span>
                <span className="text-[10px] opacity-40">Visit profile directly</span>
              </div>
            </button>
          </div>
        )}
    </div>
  );
};
