"use client";

import { useState, useEffect } from "react";
import { namehash } from "viem";
import { useAccount, useEnsName, useWriteContract, usePublicClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export const FollowButton = ({ targetName }: { targetName: string }) => {
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
        const followingJson = await publicClient.readContract({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "text",
          args: [node, "social.following"],
        }) as string;
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

  if (ensName === targetName) return null;

  return (
    <button
      className={`btn btn-sm rounded-full px-6 ${isFollowing ? "btn-outline" : "btn-primary"} ${loading ? "loading" : ""
        }`}
      onClick={handleFollow}
      disabled={loading || !ensName}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};
