// /sdk/test-multiple-simple.ts
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { createBucket, listBuckets, deleteBucket } from "./src/db/buckets";
import { uploadFile, listFiles, downloadFile, deleteFile } from "./src/db/files";
import { initClient } from "./src/lib/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function main() {
  // initialize client (env private key or provider)
  await initClient();

  // --- 1. Create a bucket ---
  const bucket = await createBucket("simple-demo");
  console.log("🪣 Created bucket:", bucket);

  // --- 2. List all buckets ---
  const buckets = await listBuckets();
  console.log("📂 Buckets:", buckets.map((b) => b.name));

  // --- 3. Upload all files in /sdk/upload ---
  const uploadDir = path.join(__dirname, "upload");
  await ensureDir(uploadDir);
  const files = await fs.readdir(uploadDir);

  if (files.length === 0) {
    console.log("⚠️  Put some files into /sdk/upload first");
    return;
  }

  for (const fname of files) {
    const filePath = path.join(uploadDir, fname);
    const meta = await uploadFile(bucket.id, filePath); // upload actual file
    console.log(`⬆️  Uploaded ${meta.name} (${meta.size} bytes)`);
    const listed = await listFiles(bucket.id);
  console.log("📂 Files in bucket:", listed.map((f) => f.name));
  }

  // --- 4. List files in the bucket ---
  const listed = await listFiles(bucket.id);
  console.log("📂 Files in bucket:", listed.map((f) => f.name));

  // --- 5. Download all files to /sdk/download ---
  const downloadDir = path.join(__dirname, "download");
  await ensureDir(downloadDir);

  for (const f of listed) {
    const dest = path.join(downloadDir, f.name);
    await downloadFile(bucket.id, f.name, dest); // real download
    console.log(`⬇️  Downloaded ${f.name} → ${dest}`);
  }

  // --- 6. Delete files ---
  for (const f of listed) {
    await deleteFile(bucket.id, f.name);
    console.log(`🗑️  Deleted file ${f.name}`);
  }

  // --- 7. Delete bucket ---
  await deleteBucket(bucket.id);
  console.log(`🗑️  Deleted bucket ${bucket.name}`);

  console.log("\n✅ Done (simple test).");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
