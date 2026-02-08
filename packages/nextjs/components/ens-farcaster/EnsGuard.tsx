"use client";

import { LandingPage } from "./LandingPage";
import { useAccount, useEnsName } from "wagmi";

export const EnsGuard = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, address } = useAccount();
  // Read ENS name from SEPOLIA (where user registered)
  const { data: ensName, isLoading: ensLoading } = useEnsName({ address, chainId: 11155111 });

  if (!isConnected) {
    return <LandingPage />;
  }

  if (ensLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 font-bold text-xl animate-pulse text-primary">Verifying ENS Identity...</p>
      </div>
    );
  }

  if (!ensName) {
    return <LandingPage hasNoEns />;
  }

  return <>{children}</>;
};
