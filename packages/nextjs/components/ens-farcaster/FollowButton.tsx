"use client";

import { useEffect, useState } from "react";
import { namehash } from "viem";
import { useAccount, useEnsName, usePublicClient, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const FollowButton = ({ targetName, size = "sm" }: { targetName: string; size?: "xs" | "sm" | "md" | "lg" }) => {
  const { address } = useAccount();
  // Read ENS name from SEPOLIA
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const publicClient = usePublicClient({ chainId: 11155111 });
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const writeTx = useTransactor();

  // Fetch current following list on mount
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!ensName || !publicClient) return;
      try {
        const node = namehash(ensName);
        const followingJson = (await publicClient.readContract({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "text",
          args: [node, "social.following"],
        })) as string;
        setFollowing(JSON.parse(followingJson || "[]"));
      } catch {
        console.warn("No following list found");
      }
    };
    fetchFollowing();
  }, [ensName, publicClient]);

  const isFollowing = following.includes(targetName);

  const handleFollow = async () => {
    if (!ensName || !address) {
      notification.error("Please connect wallet with a Sepolia ENS name");
      return;
    }

    setLoading(true);
    try {
      const node = namehash(ensName);

      let updatedFollowing;
      if (isFollowing) {
        updatedFollowing = following.filter((f: string) => f !== targetName);
      } else {
        updatedFollowing = [...following, targetName];
      }

      // Write to ENS text record
      await writeTx(() =>
        writeContractAsync({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "social.following", JSON.stringify(updatedFollowing)],
        }),
      );

      setFollowing(updatedFollowing);
      notification.success(isFollowing ? `Unfollowed ${targetName}` : `Followed ${targetName} on-chain!`);
    } catch (e: any) {
      console.error(e);
      notification.error("Failed: " + (e.shortMessage || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (ensName && targetName && ensName.toLowerCase() === targetName.toLowerCase()) return null;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`
        relative overflow-hidden transition-all duration-300 rounded-full font-bold tracking-wide
        ${size === "xs"
          ? "px-3 py-1 text-[10px] h-6 min-w-[70px]"
          : size === "sm"
            ? "px-5 py-1.5 text-xs h-8 min-w-[90px]"
            : "px-8 py-3 text-sm h-12 min-w-[140px]"
        }
        ${isFollowing
          ? "bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:border-white/40 hover:text-white"
          : "bg-primary text-primary-content shadow-[0_0_15px_rgba(var(--p),0.4)] hover:shadow-[0_0_25px_rgba(var(--p),0.6)] hover:scale-105 active:scale-95 border border-transparent"
        }
        ${loading ? "opacity-50 cursor-wait" : ""}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : isFollowing ? (
          <>
            <span>Following</span>
            <span className="text-[10px] opacity-50">✓</span>
          </>
        ) : (
          <>
            <span>Follow</span>
            <span className="text-lg leading-none mb-0.5">+</span>
          </>
        )}
      </span>
    </button>
  );
};
