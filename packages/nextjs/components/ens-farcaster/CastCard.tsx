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
  // Note: Not using useEnsAvatar as it causes CORS issues on Sepolia
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
    chainId: 11155111, // Tip preferences stored on Sepolia
  });

  const tipValue = preferredTip || "0.001";

  const handleTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetAddress) {
      notification.error("Could not find creator's wallet address. Try resolving their ENS name first.");
      return;
    }

    try {
      await writeTx(() =>
        sendTransactionAsync({
          to: targetAddress,
          value: parseEther(tipValue),
        }),
      );
      notification.success(`Tip of ${tipValue} ETH sent successfully!`);
    } catch {
      // Notification handled by writeTx wrapper usually, or silent catch
    }
  };

  return (
    <div className="bg-base-100 p-6 border-b border-base-300 hover:bg-base-200/40 transition-all cursor-pointer group relative overflow-hidden">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Link href={`/${authorName.replace(".eth", "")}`} onClick={(e) => e.stopPropagation()}>
            <div className="avatar">
              <div className="w-14 h-14 rounded-2xl ring ring-primary/10 ring-offset-base-100 ring-offset-2 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://avatar.vercel.sh/${authorName || "unknown"}`}
                  alt="avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${authorName || "unknown"}`;
                  }}
                />
              </div>
            </div>
          </Link>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 pr-12">
              <Link
                href={`/${authorName.replace(".eth", "")}`}
                className="font-black text-lg hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-[220px]"
                onClick={(e) => e.stopPropagation()}
                title={authorName}
              >
                {authorName}
              </Link>
              <span className="opacity-40 text-sm whitespace-nowrap">
                · {formatDistanceToNow(new Date(cast.timestamp), { addSuffix: true })}
              </span>
            </div>
            <button
              onClick={handleTip}
              className="btn btn-primary btn-xs rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all font-black shadow-lg"
            >
              💸 Tip
            </button>
          </div>
          <p className="text-xl break-words whitespace-pre-wrap leading-relaxed opacity-90 pr-2">{cast.text}</p>
        </div>
      </div>
    </div>
  );
};
