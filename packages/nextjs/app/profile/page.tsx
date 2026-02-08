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

      await writeTx(() =>
        writeContractAsync({
          address: SEPOLIA_RESOLVER,
          abi: PUBLIC_RESOLVER_ABI,
          functionName: "setText",
          args: [node, "description", bio],
        }),
      );

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

  const avatarUrl = `https://avatar.vercel.sh/${ensName || address}`;

  return (
    <EnsGuard>
      <div className="min-h-screen bg-base-100 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none animate-float"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Sidebar Column */}
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>

            {/* Main Content Column */}
            <div className="col-span-1 lg:col-span-9">

              {/* Profile Header Card */}
              <div className="glass-panel rounded-[3rem] p-1 border border-white/10 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-50"></div>

                <div className="bg-base-100/40 backdrop-blur-xl rounded-[2.9rem] p-8 md:p-12 relative z-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 shadow-2xl relative z-10 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full p-2 border border-white/10 shadow-lg z-20">
                        <span className="text-2xl">✨</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Sepolia Network
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-gradient">
                        {ensName || "Anonymous"}
                      </h1>
                      <p className="text-lg opacity-60 font-light max-w-xl mx-auto md:mx-0 leading-relaxed">
                        Manage your decentralized identity. Your bio, tipping preferences, and data are stored directly on-chain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                  <span className="text-9xl">⚙️</span>
                </div>

                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  Edit Profile
                  <div className="h-px flex-1 bg-white/10 ml-4"></div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="form-control gap-2">
                    <label className="label-text font-bold uppercase tracking-widest text-xs opacity-50 ml-1">Display Name</label>
                    <input
                      type="text"
                      value={ensName || ""}
                      disabled
                      className="input input-lg bg-white/5 border border-white/5 rounded-2xl text-lg font-bold opacity-70 cursor-not-allowed"
                    />
                    <span className="text-[10px] opacity-30 ml-2">Managed by ENS Protocol</span>
                  </div>

                  <div className="form-control gap-2">
                    <label className="label-text font-bold uppercase tracking-widest text-xs text-success ml-1">Tip Amount (ETH)</label>
                    <input
                      type="text"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="input input-lg bg-base-100 border border-white/10 rounded-2xl text-lg font-mono focus:border-success/50 focus:shadow-neon transition-all"
                      placeholder="0.001"
                    />
                    <span className="text-[10px] opacity-30 ml-2">Default verification cost for tips</span>
                  </div>
                </div>

                <div className="form-control gap-2 mb-10">
                  <label className="label-text font-bold uppercase tracking-widest text-xs text-primary ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="textarea textarea-lg bg-base-100 border border-white/10 rounded-2xl text-lg min-h-[160px] focus:border-primary/50 focus:shadow-neon transition-all resize-none leading-relaxed"
                    placeholder="Tell your story..."
                  />
                </div>

                <div className="flex justify-end pt-6 border-t border-white/5">
                  <button
                    onClick={handleSave}
                    disabled={loading || !ensName}
                    className="btn btn-primary btn-lg rounded-full px-10 shadow-neon hover:scale-105 transition-all font-black text-black relative overflow-hidden group"
                  >
                    {loading ? <span className="loading loading-spinner"></span> : "Save Changes"}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </EnsGuard>
  );
}
