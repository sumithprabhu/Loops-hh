"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export default function BasePage() {
  const { address, isConnected } = useAccount();
  const [showUpload, setShowUpload] = useState(false);

  // Dummy bucket + file list
  const bucketName = "my-demo-bucket";
  const files = [
    { name: "file1.txt", size: "2 KB" },
    { name: "image.png", size: "1.2 MB" },
  ];

  return (
    <main className="flex min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col justify-between">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">ShardBase</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Bucket</p>
            <p className="font-semibold">{bucketName}</p>
          </div>
        </div>
        <div className="p-6 border-t border-white/10">
          {isConnected ? (
            <div className="flex flex-col space-y-2">
              <p className="text-xs text-gray-400">Connected</p>
              <p className="text-sm truncate">{address}</p>
              <button className="mt-2 px-3 py-1 text-xs rounded bg-red-500/20 hover:bg-red-500/40">
                Logout
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not connected</p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Files</h1>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 rounded-full bg-[#7C38F2] hover:bg-[#9D79DB] transition"
          >
            + Upload
          </button>
        </div>

        {/* File list */}
        <div className="space-y-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-md bg-white/5 border border-white/10"
            >
              <span>{file.name}</span>
              <span className="text-sm text-gray-400">{file.size}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Upload modal */}
      {showUpload && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg w-96 border border-white/20">
            <h2 className="text-lg font-bold mb-4">Upload File</h2>
            <input
              type="file"
              className="mb-4 block w-full text-sm text-gray-300"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 rounded bg-gray-500/30 hover:bg-gray-500/50 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded bg-[#7C38F2] hover:bg-[#9D79DB] transition">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
