"use client";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";
import { createBucket, uploadFile, initClient } from "@sumithprabhu/edv-sdk";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [bucketId, setBucketId] = useState<string | null>(null);

  // initialize SDK once we have a wallet client
  useEffect(() => {
    if (walletClient) {
      initClient({ provider: walletClient }); // your SDK init
      console.log("✅ SDK client initialized with wallet provider");
    }
  }, [walletClient]);

  async function handleCreateBucket() {
    const bucket = await createBucket("frontend-demo");
    setBucketId(bucket.id);
    console.log("🪣 Created bucket", bucket);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!bucketId || !e.target.files?.length) return;
    const file = e.target.files[0];
    const bytes = new Uint8Array(await file.arrayBuffer());

    // ⚡ you probably want to pass the full File object or bytes, not just the name
    const meta = await uploadFile(bucketId, file.name);
    console.log("⬆️ Uploaded file", meta);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <ConnectButton />
      {isConnected && (
        <>
          <button onClick={handleCreateBucket}>Create Bucket</button>
          <input type="file" onChange={handleUpload} />
        </>
      )}
    </main>
  );
}
