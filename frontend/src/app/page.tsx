"use client";

import Link from "next/link";
import DotGrid from "./DotGrid";

export default function Home() {
  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 w-full h-full opacity-40">
        <DotGrid
          dotSize={4}
          gap={25}
          baseColor="#7C38F2"
          activeColor="#9D79DB"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      



      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-4">
        {/* Small Tag */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
          ShardBase
        </h1>
        <span className="px-4 py-1 mb-6 rounded-full bg-white/10 text-xs border border-white/20">
          ⚡ Powered by GolemDB
        </span>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-6xl font-bold mb-4">
          Your decentralized storage,
          <br /> simplified.
        </h1>

        {/* Subheading */}
        <p className="text-gray-300 mb-8 max-w-xl">
          Buckets, files, encryption — all in your control.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <Link
            href="/base"
            className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-[#7C38F2] hover:text-white transition"
          >
            Get Started
          </Link>
          <Link
            href="/docs"
            className="px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:border-[#7C38F2] hover:text-[#7C38F2] transition"
          >
            Explore Docs
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full flex justify-between px-8 text-xs text-gray-400">
        <span>Built with ❤️ on GolemDB</span>
        <span>© 2025 Shardbase</span>
      </footer>
    </main>
  );
}
