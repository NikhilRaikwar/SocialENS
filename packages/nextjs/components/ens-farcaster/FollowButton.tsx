"use client";

import { useEffect, useState } from "react";
import { namehash } from "viem";
import { useAccount, useEnsName, usePublicClient, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

// ENS Public Resolver on Ethereum Sepolia
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

type ButtonSize = "xs" | "sm" | "md" | "lg";

export const FollowButton = ({ targetName: rawTargetName, size = "sm" }: { targetName: string; size?: ButtonSize }) => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const publicClient = usePublicClient({ chainId: 11155111 });
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);
  const writeTx = useTransactor();

  // Normalize names for comparison
  const targetName = (rawTargetName || "").toLowerCase().trim();
  const myName = (ensName || "").toLowerCase().trim();

  useEffect(() => {
    const fetchFollowing = async () => {
      // If we don't have enough info, stop loading so we can at least show the "Follow" button
      if (!ensName || !publicClient) {
        setFetchingList(false);
        return;
      }

      try {
        setFetchingList(true);
        const node = namehash(ensName);
        const followingJson = (await publicClient.readContract({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "text",
          args: [node, "social.following"],
        })) as string;

        const parsed = JSON.parse(followingJson || "[]");
        if (Array.isArray(parsed)) {
          setFollowing(parsed.map((s: string) => s.toLowerCase().trim()));
        }
      } catch (e) {
        console.warn("FollowButton: Failed to fetch on-chain following list", e);
      } finally {
        setFetchingList(false);
      }
    };
    fetchFollowing();
  }, [ensName, publicClient, address]);

  const isFollowing = following.includes(targetName);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      notification.error("Connect wallet first");
      return;
    }
    if (!ensName) {
      notification.error("You need a Sepolia ENS name to interact.");
      return;
    }

    setLoading(true);
    try {
      const node = namehash(ensName);
      let updatedFollowing;

      if (isFollowing) {
        updatedFollowing = following.filter((f: string) => f !== targetName);
      } else {
        updatedFollowing = [...following, rawTargetName];
      }

      await writeTx(() =>
        writeContractAsync({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "social.following", JSON.stringify(updatedFollowing)],
        }),
      );

      setFollowing(updatedFollowing.map(s => s.toLowerCase().trim()));
      notification.success(isFollowing ? `Unfollowed!` : `Followed!`);
    } catch (e: any) {
      notification.error("Failed: " + (e.shortMessage || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Only hide if we are POSITIVE this is the logged-in user's own profile
  const isSelf = myName !== "" && targetName !== "" && myName === targetName;
  if (isSelf) return null;

  // Skeleton pulses while fetching data
  if (fetchingList) {
    return (
      <div
        className={`animate-pulse bg-base-300/30 border border-white/10 rounded-full h-full flex items-center justify-center ${
          size === "xs"
            ? "px-3 py-1 min-w-[70px] h-6"
            : size === "sm"
              ? "px-5 py-1.5 min-w-[95px] h-8"
              : "px-8 py-3 min-w-[145px] h-12"
        }`}
      >
        <span className="opacity-10 text-[10px]">Checking Graph...</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      id={`follow-btn-${targetName}`}
      className={`
        relative overflow-hidden transition-all duration-300 rounded-full font-bold tracking-wide flex items-center justify-center
        ${
          size === "xs"
            ? "px-3 py-1 text-[10px] h-6 min-w-[70px]"
            : size === "sm"
              ? "px-5 py-1.5 text-xs h-8 min-w-[95px]"
              : "px-8 py-3 text-sm h-12 min-w-[145px]"
        }
        ${
          isFollowing
            ? "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
            : "bg-primary text-primary-content shadow-[0_4px_15px_rgba(var(--p),0.3)] hover:shadow-[0_8px_25px_rgba(var(--p),0.5)] hover:scale-105 active:scale-95 border border-transparent"
        }
        ${loading ? "opacity-50 cursor-wait" : "opacity-100 visible"}
      `}
      style={{ display: "flex" }} // Enforce display flex to prevent inline hiding
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : isFollowing ? (
          <>
            <span>Following</span>
            <span className="text-[10px] opacity-70">✓</span>
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
