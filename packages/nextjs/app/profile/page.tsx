"use client";

import { useEffect, useState } from "react";
import { namehash } from "viem";
import { useAccount, useEnsAvatar, useEnsName, useEnsText, useWriteContract } from "wagmi";
import { EnsGuard } from "~~/components/ens-farcaster/EnsGuard";
import { Sidebar } from "~~/components/ens-farcaster/Sidebar";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { PUBLIC_RESOLVER_ABI } from "~~/utils/ens";
import { notification } from "~~/utils/scaffold-eth";

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

  const { data: ensAvatar } = useEnsAvatar({ name: ensName || undefined, chainId: 11155111 });
  const avatarUrl = ensAvatar || `https://avatar.vercel.sh/${ensName || address}`;

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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary truncate max-w-lg">
                          {ensName || "Anonymous"}
                        </h1>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address || "");
                            notification.success("Address copied");
                          }}
                          className="btn btn-ghost btn-sm btn-circle text-primary hover:bg-primary/10 transition-all opacity-50 hover:opacity-100"
                          title="Copy Address"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg opacity-60 font-light max-w-xl mx-auto md:mx-0 leading-relaxed">
                        Manage your decentralized identity. Your bio, tipping preferences, and data are stored directly
                        on-chain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <div className="premium-glass p-10 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden">

                <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
                  <span className="text-3xl">📝</span>
                  Edit Profile
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-4"></div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40 px-2">
                      Permanent Display Name
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={ensName || ""}
                        disabled
                        className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-6 py-4 text-xl font-black opacity-50 cursor-not-allowed outline-none"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-30">ENS RECORD</span>
                        <span className="text-xl">🛡️</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-secondary px-2">
                      Preferred Tip Amount (USDC)
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={tipAmount}
                        onChange={e => setTipAmount(e.target.value)}
                        className="w-full bg-base-100/50 border border-white/10 rounded-[1.5rem] px-6 py-4 text-xl font-mono focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all outline-none"
                        placeholder="0.001"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024" alt="USDC" className="w-6 h-6 opacity-80" />
                      </div>
                    </div>
                    <p className="text-[10px] opacity-30 px-2 leading-relaxed italic">
                      This is the default value others will see when clicking 'Tip' on your posts.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-12">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-primary px-2">
                    Personal Bio / On-Chain Story
                  </label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full bg-base-100/50 border border-white/10 rounded-[2rem] p-8 text-xl font-light min-h-[220px] focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none leading-relaxed"
                    placeholder="Tell your story to the eternal ledger..."
                  />
                  <div className="flex justify-between items-center px-2 opacity-30 text-[9px] uppercase tracking-widest font-mono">
                    <span>Public Record</span>
                    <span>Max 256 Chars</span>
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/5">
                  <button
                    onClick={handleSave}
                    disabled={loading || !ensName}
                    className="btn btn-primary border-none rounded-full h-16 px-12 hover:scale-105 active:scale-95 transition-all font-black text-lg shadow-[0_0_25px_rgba(var(--p),0.4)] flex items-center gap-4 text-white"
                  >
                    {loading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        <span>Save to ENS</span>
                        <span className="text-2xl">⚡</span>
                      </>
                    )}
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
