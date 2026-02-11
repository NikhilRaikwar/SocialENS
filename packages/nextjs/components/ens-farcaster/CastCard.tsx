"use client";

import Link from "next/link";
import { FollowButton } from "./FollowButton";
import { EnsAvatar } from "./EnsAvatar";
import { formatDistanceToNow } from "date-fns";
import { parseUnits } from "viem";
import { useEnsAddress, useEnsText, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth/useTransactor";
import { notification } from "~~/utils/scaffold-eth";

interface CastProps {
  cast: {
    id: number;
    text: string;
    timestamp: number;
    author: string;
  };
}

export const CastCard = ({ cast }: CastProps) => {
  const authorName = cast.author || (cast as any).node || "Unknown";
  // Note: Not using useEnsAvatar to avoid CORS issues
  const { data: authorAddress } = useEnsAddress({
    name: authorName.includes(".") ? authorName : "",
    chainId: 11155111,
  });

  const writeTx = useTransactor();

  const targetAddress = (cast as any).authorAddress || authorAddress;

  // Custom DeFi Preference: Authors can set their preferred tip amount in ENS
  const { data: preferredTip } = useEnsText({
    name: authorName || "",
    key: "tipAmount",
    chainId: 11155111,
  });

  const tipValue = preferredTip || "0.1"; // Default to 0.1 USDC

  // USDC on Sepolia
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const { writeContractAsync } = useWriteContract();

  const handleTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetAddress) {
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
          args: [targetAddress, parseUnits(tipValue, 6)], // USDC has 6 decimals
        }),
      );
      notification.success(`Tip sent!`);
    } catch {
      // Handled
    }
  };

  return (
    <div className="glass-panel p-6 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden border border-white/5 hover:border-primary/30">
      <div className="flex gap-4 relative z-10">
        <div className="flex-shrink-0 pt-1">
          <Link href={`/${authorName.replace(".eth", "")}`} onClick={e => e.stopPropagation()}>
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-base-100 overflow-hidden hover:scale-110 transition-transform shadow-lg">
                <EnsAvatar name={authorName} />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-grow min-w-0 pt-1">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 min-w-0">
              <Link
                href={`/${authorName.replace(".eth", "")}`}
                className="font-black text-lg hover:text-primary transition-colors truncate tracking-tight"
                onClick={e => e.stopPropagation()}
              >
                {authorName}
              </Link>
              <span className="opacity-30 text-[10px] font-mono whitespace-nowrap">
                {formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
              <FollowButton targetName={authorName} size="xs" />
              <button
                onClick={handleTip}
                className="relative overflow-hidden rounded-full font-bold tracking-wide px-3 py-1 text-[10px] h-6 min-w-[65px] bg-secondary text-secondary-content shadow-lg hover:scale-105 active:scale-95 border border-white/10 flex items-center justify-center gap-1.5"
                title={`Tip ${tipValue} USDC`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024"
                  alt="USDC"
                  className="w-3.5 h-3.5"
                />
                <span className="text-[10px]">Tip</span>
              </button>
            </div>
          </div>

          <div className="pl-1">
            <p className="text-lg leading-relaxed opacity-90 break-words whitespace-pre-wrap font-sans text-base-content/90">
              {cast.text}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl"></div>
    </div>
  );
};
