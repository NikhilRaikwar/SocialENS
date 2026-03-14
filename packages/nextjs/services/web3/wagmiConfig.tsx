import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY, ScaffoldConfig } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors(),
  ssr: true,
  client: ({ chain }) => {
    const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];

    // Build an explicit list of RPCs to avoid hidden defaults with restrictive limits (like Thirdweb)
    let rpcFallbacks = [];

    if (rpcOverrideUrl) {
      rpcFallbacks.push(http(rpcOverrideUrl));
    }

    // Add high-quality public fallbacks
    if (chain.id === 11155111) {
      rpcFallbacks.push(
        http("https://rpc.ankr.com/eth_sepolia"),
        http("https://ethereum-sepolia-rpc.publicnode.com"),
        http("https://sepolia.drpc.org"),
        http("https://eth-sepolia.public.blastapi.io"),
      );
    } else if (chain.id === 1) {
      rpcFallbacks.push(
        http("https://eth.drpc.org"),
        http("https://cloudflare-eth.com"),
        http("https://mainnet.rpc.buidlguidl.com"),
      );
    }

    // If no override was used, still try to add Alchemy if a key is present
    if (!rpcOverrideUrl) {
      const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
      if (alchemyHttpUrl) {
        // Prepend Alchemy to the public list
        rpcFallbacks = [http(alchemyHttpUrl), ...rpcFallbacks];
      }
    }

    // Finally add a generic fallback only as a last resort
    if (rpcFallbacks.length === 0) {
      rpcFallbacks.push(http());
    }

    return createClient({
      chain,
      transport: fallback(rpcFallbacks, { rank: false }), // Try them in order
      ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval } : {}),
    });
  },
});
