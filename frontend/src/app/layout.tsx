"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  getDefaultConfig,
  RainbowKitProvider,
  Chain
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();



 const golemdbKaolin = {
  id: 60138453025,
  name: "GolemDB Kaolin",
  iconUrl: "https://golem.network/assets/images/favicon.png", // replace with your own if you have a logo
  iconBackground: "#000",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://kaolin.holesky.golemdb.io/rpc"],
      webSocket: ["wss://kaolin.holesky.golemdb.io/rpc/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "GolemDB Explorer",
      url: "https://kaolin-explorer.golemdb.io", // adjust if official explorer differs
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11", // standard multicall3, confirm deployment
      blockCreated: 0, // adjust if you know the deployment block
    },
  },
} as const satisfies Chain;



const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '30bede5f518fc2c9a9900ada7ef88888',
  chains: [golemdbKaolin],
  ssr: true, // If your dApp uses server side rendering (SSR)
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
        <RainbowKitProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>

      </RainbowKitProvider>
      </TooltipProvider>

      </QueryClientProvider>
    </WagmiProvider>
    </html>
  );
}
