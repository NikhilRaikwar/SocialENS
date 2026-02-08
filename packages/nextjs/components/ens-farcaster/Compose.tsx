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
    // Get ENS name from SEPOLIA (where user registered their name)
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
            // Use the ENS name's node - user owns this on Sepolia!
            const node = namehash(ensName);
            console.log("📝 Writing to ENS name:", ensName, "Node:", node);

            // Fetch current casts from ENS text records
            let currentCasts: any[] = [];
            try {
                const latestCastsJson = await publicClient.readContract({
                    address: SEPOLIA_RESOLVER,
                    abi: PUBLIC_RESOLVER_ABI,
                    functionName: "text",
                    args: [node, "social.casts"],
                }) as string;
                currentCasts = JSON.parse(latestCastsJson || "[]");
            } catch (fetchError) {
                console.warn("No existing casts found, starting fresh.");
            }

            const newCast = {
                id: Date.now(),
                text,
                timestamp: Date.now(),
                author: ensName,
                authorAddress: address,
            };

            // Keep last 20 casts to avoid gas issues
            const updatedCasts = [newCast, ...currentCasts].slice(0, 20);
            console.log(`📤 Saving ${updatedCasts.length} casts to ENS text records...`);

            // Write to ENS text record "social.casts"
            await writeTx(() =>
                writeContractAsync({
                    address: SEPOLIA_RESOLVER,
                    abi: PUBLIC_RESOLVER_ABI,
                    functionName: "setText",
                    args: [node, "social.casts", JSON.stringify(updatedCasts)],
                }),
            );

            setText("");
            notification.success("Cast anchored on-chain via ENS! 🚀");
            window.dispatchEvent(new CustomEvent("cast-success"));

        } catch (e: any) {
            console.error("Casting Error:", e);
            notification.error("Failed to cast: " + (e.shortMessage || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-base-100/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-base-300 transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
                className="textarea textarea-bordered w-full h-40 mb-4 text-xl font-medium placeholder:text-base-content/20 resize-none focus:outline-none focus:border-primary/50 bg-base-200/30 p-4 rounded-2xl text-base-content"
                placeholder="Share your thoughts on the blockchain..."
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={280}
            />
            <div className="flex justify-between items-center border-t border-base-300/50 pt-6">
                <div className="flex gap-4">
                    <div className="tooltip" data-tip="Stored in your ENS text records on Sepolia">
                        <span className="badge badge-info badge-sm py-4 px-6 rounded-full font-bold bg-primary/10 text-primary border-none">
                            🌐 ENS: {ensName || "Connect wallet"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className={`text-sm font-black tracking-tighter ${text.length > 250 ? "text-error" : "opacity-30"}`}>
                        {text.length} / 280
                    </span>
                    <button
                        className={`btn btn-primary btn-lg rounded-2xl px-12 shadow-xl hover:scale-105 transition-all font-black text-lg flex items-center justify-center gap-2 min-w-[160px]`}
                        onClick={handleCast}
                        disabled={loading || !text || !ensName}
                    >
                        {loading && <span className="loading loading-spinner loading-xs"></span>}
                        <span>{loading ? "On-chain..." : "Cast"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
