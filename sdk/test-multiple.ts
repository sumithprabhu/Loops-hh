// /sdk/test-multiple.ts
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Buffer } from "buffer";

import { db } from "./src/lib/db";
import { buckets } from "./src";
import { generateKey, exportKey, importKey, encrypt, decrypt } from "./src/core/crypto";
import { chunkData, joinChunks } from "./src/core/chunk";   // ✅ use reusable chunker
import { Annotation } from "golem-base-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enc = new TextEncoder();
const dec = new TextDecoder();

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function ensureBucket(): Promise<string> {
  const b = await buckets.createBucket("dbchain-demo");
  console.log("🪣 bucket:", b.id);
  return b.id;
}

async function listManifests(client: Awaited<ReturnType<typeof db>>, bucketId: string) {
  const ents = await client.queryEntities(`type = "manifest" && bucketId = "${bucketId}"`);
  const names = ents.map((e: any) => {
    try { return JSON.parse(dec.decode(e.storageValue)).name; } catch { return e.entityKey; }
  });
  console.log(`📂 manifests in bucket (${bucketId}):`, names);
}

async function uploadOne(client: Awaited<ReturnType<typeof db>>, bucketId: string, filePath: string) {
  const fname = path.basename(filePath);
  const bytes = new Uint8Array(await fs.readFile(filePath));

  // per-file FEK
  const fek = await generateKey();
  const fekHex = Buffer.from(await exportKey(fek)).toString("hex");

  // split into chunks (≤60 KB each → after encryption still <120 KB)
  const { chunks, plaintextHash } = await chunkData(bytes.buffer, { chunkSize: 60 * 1024 });
  console.log(`✂️  ${fname} split into ${chunks.length} chunks, sha256=${plaintextHash}`);

  let chunkCount = 0;
  for (let idx = 0; idx < chunks.length; idx++) {
    const slice = chunks[idx];
    const encChunk = await encrypt(fek, slice);

    const packed = new Uint8Array(encChunk.iv.length + encChunk.data.length);
    packed.set(encChunk.iv, 0);
    packed.set(encChunk.data, encChunk.iv.length);

    await client.createEntities([{
      data: packed,
      btl: 600,
      stringAnnotations: [
        new Annotation("type", "chunk"),
        new Annotation("bucketId", bucketId),
        new Annotation("file", fname),
        new Annotation("index", idx.toString()),
      ],
      numericAnnotations: [],
    }]);

    chunkCount++;
  }

  // manifest
  const manifest = {
    v: 1,
    bucketId,
    name: fname,
    size: bytes.byteLength,
    keyHex: fekHex,
    chunkSize: 60 * 1024,
    sha256: plaintextHash,
  };

  await client.createEntities([{
    data: enc.encode(JSON.stringify(manifest)),
    btl: 600,
    stringAnnotations: [
      new Annotation("type", "manifest"),
      new Annotation("bucketId", bucketId),
      new Annotation("name", fname),
    ],
    numericAnnotations: [],
  }]);

  console.log(`⬆️  uploaded ${fname}: ${bytes.byteLength} bytes in ${chunkCount} chunks`);
}

async function uploadAll(client: Awaited<ReturnType<typeof db>>, bucketId: string) {
  const uploadDir = path.join(__dirname, "upload");
  await ensureDir(uploadDir);
  const files = await fs.readdir(uploadDir);
  if (files.length === 0) {
    console.log("⚠️  put some files into /sdk/upload and re-run");
    return;
  }
  for (const f of files) await uploadOne(client, bucketId, path.join(uploadDir, f));
}

function getAnnotation(anns: any[], key: string): string | undefined {
  const a = anns?.find((x: any) => x?.key === key);
  return a?.value;
}

async function downloadAll(client: Awaited<ReturnType<typeof db>>, bucketId: string) {
  const downloadDir = path.join(__dirname, "download");
  await ensureDir(downloadDir);

  const mans = await client.queryEntities(`type = "manifest" && bucketId = "${bucketId}"`);
  if (mans.length === 0) {
    console.log("ℹ️  no manifests found");
    return;
  }

  for (const man of mans) {
    let m: any;
    try { m = JSON.parse(dec.decode(man.storageValue)); } catch { continue; }

    const key = await importKey(new Uint8Array(Buffer.from(m.keyHex, "hex")));

    const chunks = await client.queryEntities(
      `type = "chunk" && bucketId = "${bucketId}" && file = "${m.name}"`
    );

    const withIndex = chunks.map((e: any) => {
      const idxStr = getAnnotation(e.stringAnnotations, "index") || "0";
      const blob   = new Uint8Array(e.storageValue); // [IV|CT]
      const iv     = blob.subarray(0, 12);
      const ct     = blob.subarray(12);
      return { index: Number(idxStr), iv, ct };
    }).sort((a, b) => a.index - b.index);

    const parts: Uint8Array[] = [];
    for (const c of withIndex) {
      const plain = await decrypt(key, { iv: c.iv, data: c.ct });
      parts.push(plain);
    }

    const rejoined = joinChunks(parts);
    await fs.writeFile(path.join(downloadDir, m.name), Buffer.from(rejoined as ArrayBuffer));
    console.log(`⬇️  downloaded ${m.name}: ${m.size} bytes → /sdk/download/${m.name}`);
  }
}

async function main() {
  const client = await db();
  const bucketId = await ensureBucket();

  console.log("\n— Before upload —");
  await listManifests(client, bucketId);

  console.log("\n— Uploading all files in /sdk/upload —");
  await uploadAll(client, bucketId);

  console.log("\n— After upload —");
  await listManifests(client, bucketId);

  console.log("\n— Downloading all to /sdk/download —");
  await downloadAll(client, bucketId);

  console.log("\n✅ Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
