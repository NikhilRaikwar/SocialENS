"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { namehash } from "viem";
import { useEnsAvatar, useEnsText, usePublicClient } from "wagmi";
import { CastCard } from "~~/components/ens-farcaster/CastCard";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { FollowButton } from "~~/components/ens-farcaster/FollowButton";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export default function UserProfilePage() {
  const params = useParams();
  const nameParam = params?.name as string;

  // Derive fullName but don't return early yet to preserve hook order
  const fullName =
    nameParam && nameParam !== "favicon.ico"
      ? nameParam.endsWith(".eth")
        ? nameParam
        : `${nameParam}.eth`
      : "";

  // Use Sepolia for reading
  const publicClient = usePublicClient({ chainId: 11155111 });
  const [casts, setCasts] = useState<any[]>([]);

  // Read ENS data from SEPOLIA
  // Pass undefined if name is invalid to disable the query internally or just let it return null
  const { data: bio } = useEnsText({
    name: fullName || undefined,
    key: "description",
    chainId: 11155111,
  });
  const { data: avatar } = useEnsAvatar({
    name: fullName || undefined,
    chainId: 11155111,
  });

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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-1 md:col-span-8 lg:col-span-6">
            <div className="flex flex-col gap-6">
              <div className="bg-base-100 rounded-3xl overflow-hidden shadow-xl border border-base-300">
                <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
                <div className="relative p-6 -mt-16">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar || `https://avatar.vercel.sh/${fullName}`}
                      alt="avatar"
                      className="w-28 h-28 rounded-full border-4 border-base-100 shadow-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${fullName}`;
                      }}
                    />
                    <div className="text-center sm:text-left flex-grow">
                      <h1 className="text-3xl font-black mb-1">{fullName}</h1>
                      {bio && <p className="opacity-60 text-lg italic">&quot;{bio}&quot;</p>}
                    </div>
                    <FollowButton targetName={fullName} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-px bg-base-300 border border-base-300 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="px-6 py-3 bg-base-100/80 border-b border-base-300">
                  <h3 className="font-bold">Casts by {fullName}</h3>
                </div>
                {casts.length === 0 ? (
                  <div className="text-center p-10 bg-base-100/80">
                    <p className="text-lg opacity-50">No casts from this user yet.</p>
                  </div>
                ) : (
                  casts.map((cast: any) => <CastCard key={cast.id} cast={cast} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnsGuard>
  );
}
