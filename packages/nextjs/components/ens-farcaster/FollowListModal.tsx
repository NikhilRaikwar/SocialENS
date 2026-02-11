"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  names: string[];
}

export const FollowListModal = ({ isOpen, onClose, title, names }: FollowListModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-base-100/80 backdrop-blur-xl transition-all animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden animate-zoom-in bg-base-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span>👥</span> {title}
            <span className="badge badge-primary badge-outline text-xs font-mono opacity-70 ml-2">{names.length}</span>
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle hover:bg-white/10 opacity-50 hover:opacity-100 transition-all"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {names.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center opacity-40">
              <span className="text-4xl mb-2">🔭</span>
              <p className="font-bold italic">No records found yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {names.map((name, i) => (
                <Link
                  key={i}
                  href={`/${name.replace(".eth", "")}`}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                  onClick={onClose}
                >
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring-2 ring-white/5 group-hover:ring-primary/40 transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://avatar.vercel.sh/${name}`}
                        alt={name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{name}</h4>
                    <p className="text-[10px] opacity-40 font-mono">ENS User</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 text-primary">
                    →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};
