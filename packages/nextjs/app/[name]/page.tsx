"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { namehash } from "viem";
import { parseUnits } from "viem";
import { useAccount, useEnsAddress, useEnsAvatar, useEnsText, usePublicClient, useWriteContract } from "wagmi";
import { CastCard } from "~~/components/ens-farcaster/CastCard";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { FollowButton } from "~~/components/ens-farcaster/FollowButton";
import { FollowListModal } from "~~/components/ens-farcaster/FollowListModal";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export default function UserProfilePage() {
  const params = useParams();
  const nameParam = params?.name as string;

  // Derive fullName but don't return early yet to preserve hook order
  const fullName =
    nameParam && nameParam !== "favicon.ico" ? (nameParam.endsWith(".eth") ? nameParam : `${nameParam}.eth`) : "";

  // Use Sepolia for reading
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [casts, setCasts] = useState<any[]>([]);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  // Read ENS data from SEPOLIA
  // Pass undefined if name is invalid to disable the query internally or just let it return null
  const { address: connectedAddress } = useAccount();
  const { data: bio } = useEnsText({
    name: fullName || undefined,
    key: "description",
    chainId: 11155111,
  });
  const { data: avatar } = useEnsAvatar({
    name: fullName || undefined,
    chainId: 11155111,
  });

  const { data: authorAddress } = useEnsAddress({
    name: fullName || undefined,
    chainId: 11155111,
  });

  const { data: preferredTip } = useEnsText({
    name: fullName || undefined,
    key: "tipAmount",
    chainId: 11155111,
  });

  const { data: followingJson } = useEnsText({
    name: fullName || undefined,
    key: "social.following",
    chainId: 11155111,
  });
  const { data: followersJson } = useEnsText({
    name: fullName || undefined,
    key: "social.followers",
    chainId: 11155111,
  });

  const followingCount = followingJson ? JSON.parse(followingJson).length : 0;
  const followersCount = followersJson ? JSON.parse(followersJson).length : 0;

  // USDC on Sepolia
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const { writeContractAsync } = useWriteContract();
  const writeTx = useTransactor();
  const tipValue = preferredTip || "0.1"; // Default to 0.1 USDC

  const handleTip = async () => {
    if (!authorAddress) {
      notification.error("Could not find creator's wallet address.");
      return;
    }

    try {
      await writeTx(() =>
        writeContractAsync({
          address: USDC_ADDRESS,
          abi: [
            {
              constant: false,
              inputs: [
                { name: "_to", type: "address" },
                { name: "_value", type: "uint256" },
              ],
              name: "transfer",
              outputs: [{ name: "", type: "bool" }],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "transfer",
          args: [authorAddress, parseUnits(tipValue, 6)], // USDC has 6 decimals
        }),
      );
      notification.success(`Tip sent!`);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    const fetchCasts = async () => {
      if (!publicClient || !fullName) return;
      try {
        const node = namehash(fullName);

        const castsJson = (await publicClient.readContract({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "text",
          args: [node, "social.casts"],
        })) as string;

        const parsedCasts = JSON.parse(castsJson || "[]").map((c: any) => ({ ...c, author: fullName }));
        setCasts(parsedCasts);
      } catch (e) {
        console.error("Error fetching user casts", e);
      }
    };
    fetchCasts();
  }, [fullName, publicClient]);

  // Now safe to return early if invalid param
  if (nameParam === "favicon.ico" || !fullName) return null;

  return (
    <EnsGuard>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Main Sidebar */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <Sidebar />
          </div>

          {/* Social Profile Content */}
          <div className="col-span-1 md:col-span-8 lg:col-span-9">
            <div className="flex flex-col gap-10">
              {/* Profile Header Card */}
              <div className="glass-panel rounded-[3rem] p-1 border border-white/10 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50"></div>

                <div className="bg-base-100/40 backdrop-blur-xl rounded-[2.9rem] p-8 md:p-12 relative z-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar || `https://avatar.vercel.sh/${fullName}`}
                        alt="Profile"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => {
                          (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${fullName}`;
                        }}
                      />
                      <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full p-2 border border-white/10 shadow-lg z-20">
                        <span className="text-2xl">✨</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1 min-w-0">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Sepolia Network
                      </div>

                      <div className="flex flex-col gap-6 w-full">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary truncate">
                              {fullName}
                            </h1>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(authorAddress || "");
                                notification.success("Address copied");
                              }}
                              className="btn btn-ghost btn-sm btn-circle text-primary hover:bg-primary/10 transition-all opacity-50 hover:opacity-100 shrink-0"
                              title="Copy Address"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Direct Action Hub */}
                          <div className="flex items-center gap-4 shrink-0">
                            <FollowButton targetName={fullName} size="lg" />
                            {(!connectedAddress || !authorAddress || connectedAddress !== authorAddress) && (
                              <button
                                onClick={handleTip}
                                className="relative overflow-hidden transition-all duration-300 rounded-full font-bold tracking-wide px-8 py-3 text-sm h-12 min-w-[140px] bg-secondary text-secondary-content shadow-[0_0_15px_rgba(var(--s),0.4)] hover:shadow-[0_0_25px_rgba(var(--s),0.6)] hover:scale-105 active:scale-95 border border-transparent flex items-center justify-center gap-2"
                                title={`Tip ${tipValue} USDC`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024"
                                  alt="USDC"
                                  className="w-5 h-5"
                                />
                                <span>Tip {tipValue}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {bio && (
                          <div className="relative pl-4 border-l-2 border-primary/30 py-2 max-w-3xl">
                            <p className="text-lg opacity-80 font-light italic leading-relaxed text-left">
                              &quot;{bio}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats/Info */}
                <div className="flex flex-col gap-8">
                  <div className="premium-glass p-8 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-xs uppercase tracking-widest font-black opacity-30 mb-6">Social Stats</h3>
                    <div className="flex flex-wrap gap-3 text-center">
                      <div className="bg-white/5 py-4 px-2 rounded-3xl border border-white/5 flex-1 min-w-[80px]">
                        <span className="block text-2xl md:text-3xl font-black text-primary">{casts.length}</span>
                        <span className="text-[9px] uppercase opacity-40 font-bold tracking-wide">Casts</span>
                      </div>
                      <div
                        className="bg-white/5 py-4 px-2 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex-1 min-w-[80px]"
                        onClick={() => setModalType("followers")}
                      >
                        <span className="block text-2xl md:text-3xl font-black text-secondary group-hover:scale-110 transition-transform">
                          {followersCount}
                        </span>
                        <span className="text-[9px] uppercase opacity-40 font-bold group-hover:opacity-100 transition-opacity tracking-wide">
                          Followers
                        </span>
                      </div>
                      <div
                        className="bg-white/5 py-4 px-2 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex-1 min-w-[80px]"
                        onClick={() => setModalType("following")}
                      >
                        <span className="block text-2xl md:text-3xl font-black text-secondary group-hover:scale-110 transition-transform">
                          {followingCount}
                        </span>
                        <span className="text-[9px] uppercase opacity-40 font-bold group-hover:opacity-100 transition-opacity tracking-wide">
                          Following
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Casts (Main Feed) */}
                <div className="lg:col-span-2">
                  <div className="premium-glass rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col min-h-[400px]">
                    <div className="px-10 py-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-xl font-black">Memory Stream</h3>
                      <div className="badge badge-outline opacity-40 font-mono text-[10px]">READING .ETH</div>
                    </div>

                    <div className="flex flex-col gap-6 p-6">
                      {casts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-center">
                          <div className="text-6xl mb-4 opacity-20">🪐</div>
                          <p className="text-xl font-bold opacity-30 italic">
                            No historical traces found on the chain.
                          </p>
                        </div>
                      ) : (
                        casts.map((cast: any) => (
                          <div key={cast.id} className="transform hover:-translate-y-1 transition-transform">
                            <CastCard cast={cast} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FollowListModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={modalType === "followers" ? "Followers" : "Following"}
        names={
          modalType === "followers"
            ? followersJson
              ? JSON.parse(followersJson)
              : []
            : followingJson
              ? JSON.parse(followingJson)
              : []
        }
      />
    </EnsGuard>
  );
}
