"use client";

import { useEffect, useState } from "react";
import { namehash } from "viem";
import { useAccount, useEnsName, useEnsText, useWriteContract } from "wagmi";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";

// ENS Public Resolver on Ethereum Sepolia (official deployment)
const SEPOLIA_RESOLVER = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";

export default function ProfilePage() {
  const { address } = useAccount();
  // Read ENS data from SEPOLIA
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const { data: fetchedBio } = useEnsText({ name: ensName || "", key: "description", chainId: 11155111 });
  const { data: fetchedTip } = useEnsText({ name: ensName || "", key: "social.tipAmount", chainId: 11155111 });
  const writeTx = useTransactor();

  const [bio, setBio] = useState("");
  const [tipAmount, setTipAmount] = useState("0.001");
  const [loading, setLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (fetchedBio) setBio(fetchedBio);
    if (fetchedTip) setTipAmount(fetchedTip);
  }, [fetchedBio, fetchedTip]);

  const handleSave = async () => {
    if (!ensName || !address) {
      notification.error("Please connect wallet with a Sepolia ENS name");
      return;
    }

    setLoading(true);
    try {
      const node = namehash(ensName);

      // Update bio in ENS text records
      await writeTx(() =>
        writeContractAsync({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "description", bio],
        }),
      );

      // Update tip preference in ENS text records
      await writeTx(() =>
        writeContractAsync({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "social.tipAmount", tipAmount],
        }),
      );

      notification.success("Profile saved to ENS! 🎉");
    } catch (e: any) {
      console.error(e);
      notification.error("Failed to update profile: " + (e.shortMessage || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Avatar URL using Vercel's service (reliable, no CORS issues)
  const avatarUrl = `https://avatar.vercel.sh/${ensName || address}`;

  return (
    <EnsGuard>
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <Sidebar />
          </div>

          <div className="col-span-1 md:col-span-8 lg:col-span-9">
            <div className="bg-base-100 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl border border-base-300 transition-all hover:border-primary/20">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div className="flex items-center gap-4">
                  {/* Profile Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-lg opacity-30"></div>
                    <img
                      src={avatarUrl}
                      alt="Profile Avatar"
                      className="w-16 h-16 rounded-full border-4 border-base-100 shadow-xl relative z-10 object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Profile Settings
                    </h1>
                    <p className="text-sm opacity-60">Your decentralized profile on ENS</p>
                  </div>
                </div>
                <div className="badge badge-primary badge-outline py-3 px-4 rounded-full flex gap-2 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Sepolia ENS
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ENS Name Field */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-bold uppercase tracking-wider text-xs opacity-60">🌐 ENS Name</span>
                    </label>
                    <input
                      type="text"
                      value={ensName || "No ENS name found"}
                      className="input input-bordered w-full bg-base-200/50 rounded-xl font-bold text-base h-12"
                      disabled
                    />
                  </div>

                  {/* Tip Amount Field */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-success">💰 Preferred Tip (ETH)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0.001"
                      className="input input-bordered w-full rounded-xl bg-base-100 focus:border-success transition-all h-12"
                      value={tipAmount}
                      onChange={e => setTipAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Biography Field */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-bold uppercase tracking-wider text-xs text-primary">📝 Biography</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24 rounded-xl bg-base-100 text-base focus:border-primary transition-all resize-none"
                    placeholder="Tell the world who you are..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button
                    className={`btn btn-primary rounded-xl px-8 shadow-lg hover:scale-105 transition-all min-h-12 ${loading ? "loading" : ""}`}
                    onClick={handleSave}
                    disabled={loading || !ensName}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      "💾 Save to ENS"
                    )}
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-base-200/50 rounded-xl text-xs opacity-60">
                    <span>⛓️</span> Stored on Sepolia
                  </div>
                </div>
              </div>

              {/* ENS Record Preview */}
              <div className="mt-8 p-4 bg-base-200/30 rounded-xl border border-base-300">
                <h3 className="text-xs font-black uppercase tracking-wider opacity-50 mb-3">📋 Your ENS Text Records</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-base-100/50 rounded-lg overflow-hidden">
                    <span className="text-primary font-mono text-xs">description:</span>
                    <p className="mt-1 opacity-70 truncate">{bio || "(not set)"}</p>
                  </div>
                  <div className="p-3 bg-base-100/50 rounded-lg overflow-hidden">
                    <span className="text-success font-mono text-xs">social.tipAmount:</span>
                    <p className="mt-1 opacity-70">{tipAmount} ETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EnsGuard>
  );
}
