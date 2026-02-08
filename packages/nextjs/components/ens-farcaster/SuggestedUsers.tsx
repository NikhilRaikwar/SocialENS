"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { FollowButton } from "./FollowButton";

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
                const logs = await publicClient.getLogs({
                    address: SEPOLIA_RESOLVER,
                    event: parseAbiItem(
                        "event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
                    ),
                    fromBlock: currentBlock - 5000n,
                });

                // This is a bit of a trick: we want to find names, but logs only show nodes (hashes).
                // However, in our app, the 'value' of social.casts contains the 'author' name!
                const foundNames = logs
                    .filter(log => log.args.key === "social.casts")
                    .map(log => {
                        try {
                            const parsed = JSON.parse(log.args.value || "[]");
                            return parsed[0]?.author;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as string[];

                const uniqueNames = Array.from(new Set(foundNames)).slice(0, 5);
                setUsers(uniqueNames);
            } catch (e) {
                console.error("Discovery error:", e);
            } finally {
                setLoading(false);
            }
        };

        discoverUsers();
    }, [publicClient]);

    if (loading) return <div className="animate-pulse flex flex-col gap-4 p-4">
        <div className="h-4 w-24 bg-base-300 rounded"></div>
        <div className="h-12 bg-base-300 rounded-xl"></div>
        <div className="h-12 bg-base-300 rounded-xl"></div>
    </div>;

    if (users.length === 0) return null;

    return (
        <div className="glass-panel p-5 rounded-[2rem] border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Discover Users
            </h3>

            <div className="flex flex-col gap-3">
                {users.map((name) => (
                    <div key={name} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors group">
                        <Link href={`/${name.replace(".eth", "")}`} className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`https://avatar.vercel.sh/${name}`} alt={name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold truncate opacity-80 group-hover:opacity-100 transition-opacity">{name}</span>
                        </Link>
                        <FollowButton targetName={name} size="xs" />
                    </div>
                ))}
            </div>
        </div>
    );
};
