"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { parseEther } from "viem";
import { useEnsAddress, useEnsText, useSendTransaction } from "wagmi";
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
  const { sendTransactionAsync } = useSendTransaction();
  const writeTx = useTransactor();

  const targetAddress = (cast as any).authorAddress || authorAddress;

  // Custom DeFi Preference: Authors can set their preferred tip amount in ENS
  const { data: preferredTip } = useEnsText({
    name: authorName || "",
    key: "tipAmount",
    chainId: 11155111,
  });

  const tipValue = preferredTip || "0.001";

  const handleTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetAddress) {
      notification.error("Could not find creator's wallet address.");
      return;
    }

    try {
      await writeTx(() =>
        sendTransactionAsync({
          to: targetAddress,
          value: parseEther(tipValue),
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
        <div className="flex-shrink-0">
          <Link href={`/${authorName.replace(".eth", "")}`} onClick={e => e.stopPropagation()}>
            <div className="avatar">
              <div className="w-14 h-14 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-base-100 overflow-hidden hover:scale-110 transition-transform shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://avatar.vercel.sh/${authorName || "unknown"}`}
                  alt="avatar"
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${authorName || "unknown"}`;
                  }}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-grow min-w-0 pt-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 min-w-0">
              <Link
                href={`/${authorName.replace(".eth", "")}`}
                className="font-bold text-lg hover:text-primary transition-colors truncate tracking-tight"
                onClick={e => e.stopPropagation()}
              >
                {authorName}
              </Link>
              <span className="opacity-40 text-xs font-mono">
                {formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true })}
              </span>
            </div>

            <button
              onClick={handleTip}
              className="btn btn-secondary btn-xs rounded-full opacity-0 group-hover:opacity-100 transition-all font-bold shadow-lg scale-90 group-hover:scale-100"
              title={`Tip ${tipValue} ETH`}
            >
              💸 Tip
            </button>
          </div>

          <p className="text-xl font-light leading-relaxed opacity-90 break-words whitespace-pre-wrap">{cast.text}</p>
        </div>
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl"></div>
    </div>
  );
};
