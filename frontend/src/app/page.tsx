"use client";

import Link from "next/link";
import DotGrid from "./DotGrid";
import react, { useState } from "react";
import { initClient } from "shardbase";

import { createBucket, uploadFile } from "shardbase"; // or "shardbase" once published
declare module "react" {
  interface InputHTMLAttributes<T>
    extends React.AriaAttributes,
      React.DOMAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bucketId, setBucketId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const fileName = "sample.txt"; // Example file name to download
  const fixedBI =
    "0xd16fbfc5c2617897560a43e0fb29108615dd2de5bafe3cb8da9b592285afc0b4";

  async function handleDownload() {
    try {
      setDownloading(true);

      // Call your API route
      const res = await fetch(
        `http://localhost:3000/api/files/download?bucketId=${fixedBI}&fileName=${encodeURIComponent(
          fileName
        )}`
      );

      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      // Get the file as a Blob
      const blob = await res.blob();

      // Create temporary URL & trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCreate() {
    await initClient({
      privateKey:
        "0x3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998",
    });
    try {
      setLoading(true);
      const bucket = await createBucket("demo-bucket");
      setBucketId(bucket.id);
      console.log("✅ Bucket created:", bucket);
    } catch (err) {
      console.error("❌ Error creating bucket:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !bucketId) return;

    try {
      setStatus(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("bucketId", bucketId);
      formData.append("file", file);

      const res = await fetch("http://localhost:3000/api/files", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const meta = await res.json();
      console.log("✅ Uploaded:", meta);
      setStatus(`✅ Uploaded ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed");
    }
  }

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
        <span>Built on GolemDB</span>
        <span>© 2025 Shardbase</span>
      </footer>
    </main>
  );
}
