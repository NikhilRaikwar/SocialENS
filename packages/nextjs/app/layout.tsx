import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "SocialENS | Decentralized Social Network",
  description: "The first fully decentralized social network powered by ENS text records. Your profile, follows, and posts stored 100% on-chain on Ethereum Sepolia.",
  imageRelativePath: "/logo.png",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <head>
        <meta name="keywords" content="ENS, Ethereum, Social Network, Decentralized, Web3, Farcaster, Blockchain, DeFi, Sepolia" />
        <meta name="author" content="SocialENS Team" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SocialENS" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
