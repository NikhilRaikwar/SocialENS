"use client";

import { useEnsAvatar } from "wagmi";

interface EnsAvatarProps {
    name?: string | null;
    className?: string;
    address?: string;
}

/**
 * Component to display an ENS avatar with a fallback.
 * It specifically tries to resolve the avatar from the Sepolia chain (11155111).
 */
export const EnsAvatar = ({ name, className, address }: EnsAvatarProps) => {
    const { data: avatar } = useEnsAvatar({
        name: name && name.includes(".") ? name : undefined,
        chainId: 11155111,
    });

    const fallback = `https://avatar.vercel.sh/${name || address || "unknown"}`;
    const avatarUrl = avatar || fallback;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={avatarUrl}
            alt={`${name || "User"} avatar`}
            className={className || "w-full h-full object-cover rounded-full"}
            onError={(e) => {
                (e.target as HTMLImageElement).src = fallback;
            }}
        />
    );
};
