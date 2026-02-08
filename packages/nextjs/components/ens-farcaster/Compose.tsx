"use client";

import { useState } from "react";
import { namehash } from "viem";
import { useAccount, useEnsName, useWriteContract, usePublicClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const Compose = () => {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address, chainId: 11155111 });
    const { writeContractAsync } = useWriteContract();
    const writeTx = useTransactor();
    const publicClient = usePublicClient({ chainId: 11155111 });
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCast = async () => {
        if (!text || !ensName || !publicClient || !address) {
            notification.error("Please connect wallet with an ENS name on Sepolia");
            return;
        }

        setLoading(true);
        try {
            const node = namehash(ensName);
            console.log("📝 Writing to ENS name:", ensName, "Node:", node);

            let currentCasts: any[] = [];
            try {
                const latestCastsJson = await publicClient.readContract({
                    address: SEPOLIA_RESOLVER,
                    abi: PUBLIC_RESOLVER_ABI,
                    functionName: "text",
                    args: [node, "social.casts"],
                }) as string;
                currentCasts = JSON.parse(latestCastsJson || "[]");
            } catch {
                console.warn("No existing casts found, starting fresh.");
            }

            const newCast = {
                id: Date.now(),
                text,
                timestamp: Date.now(),
                author: ensName,
                authorAddress: address,
            };

            const updatedCasts = [newCast, ...currentCasts].slice(0, 20);

            await writeTx(() =>
                writeContractAsync({
                    address: SEPOLIA_RESOLVER,
                    abi: PUBLIC_RESOLVER_ABI,
                    functionName: "setText",
                    args: [node, "social.casts", JSON.stringify(updatedCasts)],
                }),
            );

            setText("");
            notification.success("Cast anchored on-chain! 🚀");
            window.dispatchEvent(new CustomEvent("cast-success"));

        } catch (e: any) {
            console.error("Casting Error:", e);
            notification.error("Failed to cast: " + (e.shortMessage || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 shadow-glass transition-all duration-300 focus-within:shadow-neon focus-within:border-primary/30 relative overflow-hidden">

            <textarea
                className="textarea textarea-ghost w-full h-32 mb-2 text-xl font-medium placeholder:text-base-content/20 resize-none focus:outline-none focus:bg-transparent bg-transparent p-2 text-base-content leading-relaxed"
                placeholder="What's happening on-chain?"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={280}
            />

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    {ensName && (
                        <div className="badge badge-neutral gap-2 py-3 px-4 rounded-full border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                            <span className="font-bold opacity-80">{ensName}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span className={`text-xs font-mono tracking-widest ${text.length > 250 ? "text-error" : "opacity-30"}`}>
                        {text.length}/280
                    </span>

                    <button
                        className={`btn btn-primary btn-md rounded-full px-8 shadow-neon hover:scale-105 transition-all font-black text-black border-none relative overflow-hidden`}
                        onClick={handleCast}
                        disabled={loading || !text || !ensName}
                    >
                        {loading && <span className="loading loading-spinner loading-xs text-black"></span>}
                        <span className="relative z-10">{loading ? "Minting..." : "Cast"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
        </div>
    );
};
