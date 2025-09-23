// /src/db/files.ts
import { getClient } from "../lib/client";
import { Annotation } from "golem-base-sdk";
import { generateKey, exportKey, importKey, encrypt, decrypt } from "../core/crypto";
import type { FileMeta } from "../types";
import { promises as fs } from "fs";
import path from "path";

const enc = new TextEncoder();
const dec = new TextDecoder();
const CHUNK_SIZE = 60 * 1024; // 60 KB

// --- helper for annotations ---
function getAnnotation(
  anns: { key: string; value: string }[] | undefined,
  key: string
): string | undefined {
  if (!anns) return undefined;
  const a = anns.find((x) => x.key === key);
  return a?.value;
}

// --- Upload ---
export async function uploadFile(bucketId: string, filePath: string): Promise<FileMeta> {
  const client = getClient();
  const name = path.basename(filePath);
  const bytes = new Uint8Array(await fs.readFile(filePath));

  // Per-file FEK
  const fek = await generateKey();
  const fekHex = Buffer.from(await exportKey(fek)).toString("hex");

  // Chunk + encrypt
  let idx = 0;
  for (let off = 0; off < bytes.length; off += CHUNK_SIZE, idx++) {
    const slice = bytes.subarray(off, Math.min(off + CHUNK_SIZE, bytes.length));
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
        new Annotation("file", name),
        new Annotation("index", idx.toString()),
      ],
      numericAnnotations: [],
    }]);
  }

  // Manifest
  const manifest = {
    v: 1,
    bucketId,
    name,
    size: bytes.byteLength,
    keyHex: fekHex,
    chunkSize: CHUNK_SIZE,
    createdAt: Date.now(),
  };

  await client.createEntities([{
    data: enc.encode(JSON.stringify(manifest)),
    btl: 600,
    stringAnnotations: [
      new Annotation("type", "manifest"),
      new Annotation("bucketId", bucketId),
      new Annotation("name", name),
    ],
    numericAnnotations: [],
  }]);

  return {
    id: name,
    bucketId,
    name,
    size: bytes.byteLength,
    createdAt: manifest.createdAt,
  };
}

// --- List ---
export async function listFiles(bucketId: string): Promise<FileMeta[]> {
  const client = getClient();
  const mans = await client.queryEntities(`type = "manifest" && bucketId = "${bucketId}"`);
  return mans.map((m: any) => {
    try {
      const obj = JSON.parse(dec.decode(m.storageValue));
      return {
        id: m.entityKey,
        bucketId,
        name: obj.name,
        size: obj.size,
        createdAt: obj.createdAt ?? Date.now(),
      };
    } catch {
      return {
        id: m.entityKey,
        bucketId,
        name: "unknown",
        size: 0,
        createdAt: Date.now(),
      };
    }
  });
}

// --- Download ---
export async function downloadFile(bucketId: string, fileName: string, destPath: string): Promise<void> {
  const client = getClient();

  // get manifest
  const mans = await client.queryEntities(`type = "manifest" && bucketId = "${bucketId}" && name = "${fileName}"`);
  if (mans.length === 0) throw new Error("File not found");
  const m = JSON.parse(dec.decode(mans[0].storageValue));

  const key = await importKey(new Uint8Array(Buffer.from(m.keyHex, "hex")));

  // fetch + sort chunks
  const chunks = await client.queryEntities(`type = "chunk" && bucketId = "${bucketId}" && file = "${fileName}"`);
  const withIndex = chunks.map((e: any) => {
    const idx = Number(getAnnotation(e.stringAnnotations, "index") ?? "0");
    const blob = new Uint8Array(e.storageValue);
    const iv = blob.subarray(0, 12);
    const ct = blob.subarray(12);
    return { index: idx, iv, ct };
  }).sort((a, b) => a.index - b.index);

  const parts: Uint8Array[] = [];
  for (const c of withIndex) {
    const plain = await decrypt(key, { iv: c.iv, data: c.ct });
    parts.push(plain);
  }

  const merged = Buffer.concat(parts.map(p => Buffer.from(p)));
  await fs.writeFile(destPath, merged);
}

// --- Delete ---
export async function deleteFile(bucketId: string, fileName: string): Promise<void> {
  const client = getClient();

  const mans = await client.queryEntities(`type = "manifest" && bucketId = "${bucketId}" && name = "${fileName}"`);
  const chunks = await client.queryEntities(`type = "chunk" && bucketId = "${bucketId}" && file = "${fileName}"`);

  const ids = [
    ...mans.map((m: any) => m.entityKey),
    ...chunks.map((c: any) => c.entityKey),
  ];
  if (ids.length > 0) {
    await client.deleteEntities(ids as `0x${string}`[]);
  }
}
